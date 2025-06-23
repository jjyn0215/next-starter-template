'use client'; // 이 지시어는 이 컴포넌트가 클라이언트 컴포넌트임을 나타냅니다

import { useState, useEffect } from 'react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  time: string;
}

export default function ClientWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 클라이언트 사이드에서 API를 호출하여 데이터를 가져옵니다
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        // 1초 지연 (로딩 상태를 보여주기 위함)
        // await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch('/api/weather');
        
        if (!response.ok) {
          throw new Error('날씨 데이터를 가져오는데 실패했습니다');
        }
        
        const data = await response.json() as WeatherData;
        setWeatherData(data);
      } catch (err) {
        console.error('날씨 데이터 가져오기 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-md w-full flex items-center justify-center">
        <div className="text-xl">클라이언트에서 데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-red-500">에러 발생</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">데이터 없음</h2>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4">
        클라이언트 사이드 렌더링 (CSR)
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
