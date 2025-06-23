import { Suspense } from 'react';
import Link from 'next/link';

/**
 * 이 파일은 Next.js의 App Router에서 서버 컴포넌트(Server Component)를 사용한 SSR 예제입니다.
 * 
 * Next.js 13 이상에서는 모든 컴포넌트가 기본적으로 서버 컴포넌트로 동작합니다.
 * 서버 컴포넌트의 특징:
 * 1. 서버에서만 실행되며 클라이언트로 JS를 전송하지 않음
 * 2. 데이터 페칭을 직접 수행할 수 있음 (useEffect나 useState 없이)
 * 3. 서버 리소스에 직접 접근 가능 (데이터베이스, 파일 시스템 등)
 */

// 서버 컴포넌트 - 날씨 데이터를 가져오는 함수
async function getWeatherData() {
  // 실제 API 호출을 시뮬레이션 (실제로는 환경 변수에 API 키를 저장해야 함)
  // 여기서는 데모용으로 정적 데이터를 반환합니다
  await new Promise((resolve) => setTimeout(resolve, 1000)); // API 호출 지연 시뮬레이션
  
  return {
    location: '서울',
    temperature: 23,
    condition: '맑음',
    humidity: 60,
    windSpeed: 5,
    time: new Date().toLocaleString('ko-KR'),
  };
}

// 날씨 표시 컴포넌트 - 이것도 서버 컴포넌트입니다 (async 키워드 사용)
async function WeatherDisplay() {
  // 데이터를 서버에서 가져옴 (SSR)
  // async/await을 직접 사용할 수 있는 것이 서버 컴포넌트의 장점입니다
  const weatherData = await getWeatherData();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4">
        {weatherData.location}의 날씨
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
          <div className="text-xl">{weatherData.condition}</div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 dark:text-gray-400">습도</p>
              <p className="font-medium">{weatherData.humidity}%</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">풍속</p>
              <p className="font-medium">{weatherData.windSpeed} m/s</p>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          마지막 업데이트: {weatherData.time}
        </div>
      </div>
    </div>
  );
}

// 페이지 컴포넌트
export default function WeatherPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">서버 사이드 렌더링 예제</h1>
      
      <div className="mb-8">
        <p className="text-center max-w-md mb-4">
          이 페이지는 Next.js의 서버 컴포넌트를 사용하여 서버 사이드 렌더링(SSR)을 구현합니다.
          날씨 데이터는 서버에서 가져와 완전히 렌더링된 HTML로 클라이언트에 전달됩니다.
        </p>
      </div>
      
      {/* Suspense를 사용하여 데이터 로딩 중에 대체 UI 표시 */}
      <Suspense fallback={<div className="text-xl">날씨 데이터를 불러오는 중...</div>}>
        <WeatherDisplay />
      </Suspense>
      
      <div className="mt-8">
        <Link 
          href="/" 
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm px-4 py-2"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
