import { NextResponse } from 'next/server';

export async function GET() {
  // 실제 API 호출 대신 가짜 데이터 (실제로는 외부 API를 호출할 수 있음)
  await new Promise((resolve) => setTimeout(resolve, 1000)); // API 지연 시뮬레이션
  
  const weatherData = {
    location: '서울',
    temperature: 23,
    condition: '맑음',
    humidity: 60,
    windSpeed: 5,
    time: new Date().toLocaleString('ko-KR'),
  };
  
  return NextResponse.json(weatherData);
}
