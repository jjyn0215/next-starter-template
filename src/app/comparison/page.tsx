import Link from 'next/link';
import { Suspense } from 'react';
import ClientWeather from './client-weather';

// 서버 컴포넌트에서 데이터 가져오기 (SSR)
async function getWeatherData() {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 지연 시뮬레이션
  
  return {
    location: '서울',
    temperature: 23,
    condition: '맑음',
    humidity: 60,
    windSpeed: 5,
    time: new Date().toLocaleString('ko-KR'),
  };
}

// 서버 컴포넌트 - SSR
async function ServerWeather() {
  const weatherData = await getWeatherData();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4">
        서버 사이드 렌더링 (SSR)
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

export default function ComparisonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">SSR vs CSR 비교</h1>
      
      <div className="mb-8">
        <p className="text-center max-w-2xl mb-4">
          이 페이지는 Next.js에서 서버 사이드 렌더링(SSR)과 클라이언트 사이드 렌더링(CSR)을 비교합니다.
          왼쪽은 서버에서 렌더링된 컴포넌트이고, 오른쪽은 클라이언트에서 데이터를 가져와 렌더링됩니다.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center">
        {/* 서버 사이드 렌더링 */}
        <Suspense fallback={<div className="text-xl">서버에서 데이터를 불러오는 중...</div>}>
          <ServerWeather />
        </Suspense>
        
        {/* 클라이언트 사이드 렌더링 */}
        <ClientWeather />
      </div>
      
      <div className="mt-12 flex gap-4">
        <Link 
          href="/" 
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm px-4 py-2"
        >
          홈으로 돌아가기
        </Link>
        <Link 
          href="/weather" 
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm px-4 py-2"
        >
          날씨 페이지로 이동
        </Link>
      </div>
    </div>
  );
}
