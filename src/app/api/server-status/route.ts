import { NextResponse } from 'next/server';

// 서버 상태를 체크하는 함수
async function checkServerStatus(url: string): Promise<'online' | 'offline' | 'degraded'> {
  try {
    // HTTP 요청을 보내고 응답을 확인
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
    
    const response = await fetch(url, { 
      method: 'GET',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    
    // 응답 코드에 따라 상태 반환
    if (response.ok) {
      // 정상 응답 (200~299)
      return 'online';
    } else if (response.status >= 400 && response.status < 500) {
      // 클라이언트 에러 (400~499)
      return 'degraded';
    } else {
      // 서버 에러 (500~599)
      return 'degraded';
    }
  } catch {
    // 요청 실패 또는 타임아웃
    return 'offline';
  }
}

// 응답 시간을 측정하는 함수
async function measureResponseTime(url: string): Promise<number | null> {
  try {
    const start = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
    
    await fetch(url, { 
      method: 'GET',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    const end = performance.now();
    
    return Math.round(end - start);
  } catch {
    return null;
  }
}

// SSL 인증서 정보를 가져오는 함수 (모의 데이터)
function getSSLInfo(url: string, status: 'online' | 'offline' | 'degraded'): { isValid: boolean; expiresIn: string } {
  if (status === 'offline') {
    return { isValid: false, expiresIn: '확인 불가' };
  }
  
  // 실제로는 서버에서 SSL 정보를 가져와야 함
  // 여기서는 모의 데이터 생성
  const isValid = Math.random() > 0.1; // 90%는 유효함
  const daysToExpire = Math.floor(Math.random() * 300) + 10; // 10-310일
  
  return {
    isValid,
    expiresIn: `${daysToExpire}일`
  };
}

// 가용성 데이터 생성 (모의 데이터)
function getAvailability(status: 'online' | 'offline' | 'degraded'): { last24h: string; last7d: string } {
  if (status === 'offline') {
    return { last24h: '0%', last7d: '45-70%' };
  } else if (status === 'degraded') {
    return { last24h: '85-95%', last7d: '80-95%' };
  } else {
    return { last24h: '99-100%', last7d: '98-100%' };
  }
}

// 마지막 다운타임 정보 (모의 데이터)
function getLastDowntime(status: 'online' | 'offline' | 'degraded'): string {
  if (status === 'offline') {
    return '현재 다운';
  }
  
  const now = new Date();
  
  if (status === 'degraded') {
    // 1-48시간 전
    const hoursAgo = Math.floor(Math.random() * 48) + 1;
    const downtime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    return downtime.toLocaleString('ko-KR');
  } else {
    // 1-30일 전
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const downtime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return downtime.toLocaleString('ko-KR');
  }
}

// 서버 상태 정보를 제공하는 API
export async function GET() {
  // 실제 환경에서는 구성 파일이나 데이터베이스에서 서버 목록을 가져올 수 있습니다
  const servers = [
    {
      id: '1',
      name: 'Proxmox',
      url: 'https://mox.salmakis.online/',
      uptime: '99.9%',
    },
    {
      id: '2',
      name: 'Home Assistant',
      url: 'https://hass.salmakis.online/',
      uptime: '98.2%',
    },
    {
      id: '3',
      name: 'NAS',
      url: 'https://nas.salmakis.online/',
      uptime: '100.0%',
    },
    {
      id: '4',
      name: 'Status Page',
      url: 'https://status.salmakis.online/',
      uptime: '85.7%',
    }
  ];

  // 각 서버 상태 확인
  const serversWithStatus = await Promise.all(
    servers.map(async (server) => {
      const status = await checkServerStatus(server.url);
      const responseTime = status !== 'offline' ? await measureResponseTime(server.url) : 0;
      
      // CPU, 메모리, 디스크 대신 다른 유용한 정보 추가
      const sslInfo = getSSLInfo(server.url, status);
      const availability = getAvailability(status);
      const lastDowntime = getLastDowntime(status);
      
      // 최근 응답 시간 기록 (모의 데이터)
      const responseHistory = Array.from({ length: 12 }, () => {
        return status === 'offline' ? 0 : Math.floor(Math.random() * 200) + 50;
      });
      
      return {
        id: server.id,
        name: server.name,
        status,
        uptime: server.uptime,
        responseTime: responseTime || 0,
        lastChecked: new Date().toISOString(),
        // 추가 정보
        sslInfo,
        availability,
        lastDowntime,
        responseHistory
      };
    })
  );

  // 시스템 전체 상태 계산
  const systemStatus = serversWithStatus.some(server => server.status === 'offline') 
    ? 'critical' 
    : serversWithStatus.some(server => server.status === 'degraded') 
      ? 'warning' 
      : 'healthy';

  return NextResponse.json({
    status: systemStatus,
    timestamp: new Date().toISOString(),
    servers: serversWithStatus,
    summary: {
      total: serversWithStatus.length,
      online: serversWithStatus.filter(s => s.status === 'online').length,
      degraded: serversWithStatus.filter(s => s.status === 'degraded').length,
      offline: serversWithStatus.filter(s => s.status === 'offline').length
    }
  });
}
