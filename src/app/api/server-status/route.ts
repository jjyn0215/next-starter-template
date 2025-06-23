import { NextResponse } from 'next/server';

// 서버 상태 정보를 제공하는 API
export async function GET() {
  // 실제 구현에서는 여기에 실제 서버 상태를 가져오는 로직이 들어갑니다
  // 예를 들어, 데이터베이스 연결, 캐시 서비스, 외부 API 등의 상태를 확인할 수 있습니다
  
  const mockServers = [
    {
      id: '1',
      name: '웹 서버',
      status: 'online', // online, degraded, offline
      uptime: '99.9%',
      responseTime: 120, // ms
      lastChecked: new Date().toISOString(),
      cpu: 23, // percentage
      memory: 45, // percentage
      disk: 62, // percentage
    },
    {
      id: '2',
      name: '데이터베이스 서버',
      status: 'degraded',
      uptime: '98.2%',
      responseTime: 210,
      lastChecked: new Date().toISOString(),
      cpu: 76,
      memory: 82,
      disk: 55,
    },
    {
      id: '3',
      name: '캐시 서버',
      status: 'online',
      uptime: '100.0%',
      responseTime: 15,
      lastChecked: new Date().toISOString(),
      cpu: 12,
      memory: 34,
      disk: 25,
    },
    {
      id: '4',
      name: '인증 서버',
      status: 'offline',
      uptime: '85.7%',
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      cpu: 0,
      memory: 0,
      disk: 78,
    }
  ];

  // 시스템 전체 상태 계산
  const systemStatus = mockServers.some(server => server.status === 'offline') 
    ? 'critical' 
    : mockServers.some(server => server.status === 'degraded') 
      ? 'warning' 
      : 'healthy';

  return NextResponse.json({
    status: systemStatus,
    timestamp: new Date().toISOString(),
    servers: mockServers,
    summary: {
      total: mockServers.length,
      online: mockServers.filter(s => s.status === 'online').length,
      degraded: mockServers.filter(s => s.status === 'degraded').length,
      offline: mockServers.filter(s => s.status === 'offline').length
    }
  });
}
