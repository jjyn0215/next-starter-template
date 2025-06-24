import { unstable_noStore as noStore } from 'next/cache';

// 타입 정의
interface Server {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: string;
  responseTime: number;
  lastChecked: string;
  // 새로운 필드들
  sslInfo: {
    isValid: boolean;
    expiresIn: string;
  };
  availability: {
    last24h: string;
    last7d: string;
  };
  lastDowntime: string;
  responseHistory: number[];
}

interface ServerStatusResponse {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  servers: Server[];
  summary: {
    total: number;
    online: number;
    degraded: number;
    offline: number;
  };
}

// 서버 데이터를 가져오는 함수
async function getServerStatus(): Promise<ServerStatusResponse> {
  noStore(); // 캐시 사용 안 함 (항상 최신 데이터)
  
  try {
    // 실제 환경에서는 절대 URL을 사용해야 할 수 있습니다
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/server-status`, {
      next: { revalidate: 30 }, // 30초마다 재검증
    });
    
    if (!response.ok) {
      throw new Error('서버 상태를 가져오는데 실패했습니다');
    }
    
    return await response.json();
  } catch (error) {
    console.error('서버 상태 가져오기 오류:', error);
    throw error;
  }
}

// 상태에 따른 배경색 반환
function getStatusColor(status: 'online' | 'offline' | 'degraded'): string {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400';
    case 'degraded':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400';
    case 'offline':
      return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
  }
}

// 전체 시스템 상태에 따른 배경색 반환
function getSystemStatusColor(status: 'healthy' | 'warning' | 'critical'): string {
  switch (status) {
    case 'healthy':
      return 'bg-green-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'critical':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

// 사용량 바 컴포넌트
function UsageBar({ percentage, type }: { percentage: number; type: string }) {
  // 색상 설정
  let colorClass = 'bg-blue-500';
  
  if (type === 'response') {
    colorClass = percentage > 500 ? 'bg-red-500' : percentage > 200 ? 'bg-yellow-500' : 'bg-blue-500';
  } else {
    colorClass = percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-blue-500';
  }

  return (
    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass} rounded-full transition-all duration-500 ease-in-out`} 
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );
}

// 응답 시간 그래프 컴포넌트 
function ResponseTimeChart({ data }: { data: number[] }) {
  const maxValue = Math.max(...data, 100); // 최소 높이를 위해 100 추가
  
  return (
    <div className="flex items-end h-16 gap-1 mt-2">
      {data.map((value, index) => {
        // 값에 따른 색상 결정
        const colorClass = value > 500 ? 'bg-red-500' : value > 200 ? 'bg-yellow-500' : 'bg-blue-500';
        // 높이 계산 (최대 높이의 백분율)
        const heightPercentage = value === 0 ? 0 : Math.max(15, (value / maxValue) * 100);
        
        return (
          <div 
            key={index} 
            className={`flex-1 ${colorClass} rounded-t transition-all duration-300`}
            style={{ height: `${heightPercentage}%` }}
            title={`${value}ms`}
          ></div>
        );
      })}
    </div>
  );
}

// 상태 배지 컴포넌트
function StatusBadge({ status }: { status: 'online' | 'offline' | 'degraded' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(status)}`}>
      {status === 'online' ? '온라인' : status === 'degraded' ? '성능 저하' : '오프라인'}
    </span>
  );
}

// 서버 상태 대시보드 컴포넌트
export default async function ServerStatusDashboard() {
  const data = await getServerStatus();
  const { servers, status, summary, timestamp } = data;
  
  const formattedTime = new Date(timestamp).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="space-y-8">
      {/* 시스템 요약 카드 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">시스템 상태 요약</h2>
          <div className={`w-3 h-3 rounded-full ${getSystemStatusColor(status)}`}></div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400">총 서버</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">온라인</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.online}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">성능 저하</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{summary.degraded}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">오프라인</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.offline}</p>
          </div>
        </div>
        
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          마지막 업데이트: {formattedTime}
        </p>
      </div>
      
      {/* 서버 리스트 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">서버 상태</h2>
        </div>
        
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {servers.map((server) => {
            const lastCheckedTime = new Date(server.lastChecked).toLocaleString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
            
            return (
              <div key={server.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mr-3">
                        {server.name}
                      </h3>
                      <StatusBadge status={server.status} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      가동 시간: {server.uptime} · 응답 시간: {server.status !== 'offline' ? `${server.responseTime}ms` : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      마지막 확인: {lastCheckedTime}
                    </span>
                  </div>
                </div>
                
                {server.status !== 'offline' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">응답 시간 변화</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {server.responseTime}ms
                          </span>
                        </div>
                        <ResponseTimeChart data={server.responseHistory} />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500 dark:text-slate-400">가용성 (24시간)</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {server.availability.last24h}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">가용성 (7일)</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {server.availability.last7d}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500 dark:text-slate-400">마지막 다운타임</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {server.lastDowntime}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500 dark:text-slate-400">SSL 인증서</span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            server.sslInfo.isValid ? 
                            'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 
                            'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                          }`}>
                            {server.sslInfo.isValid ? '유효함' : '만료됨'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">만료 기간</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {server.sslInfo.expiresIn}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {server.status === 'offline' && (
                  <div className="mt-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">이 서버는 현재 오프라인 상태입니다. 관리자에게 문의하세요.</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">마지막 다운타임: {server.lastDowntime}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 실시간 새로고침 안내 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
          이 페이지는 30초마다 자동으로 새로고침됩니다. 수동 새로고침을 하려면 페이지를 새로고침하세요.
        </p>
      </div>
    </div>
  );
}
