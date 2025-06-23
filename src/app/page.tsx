import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import ServerStatusDashboard from "./server-status/server-status-dashboard";

export const metadata = {
  title: "서버 상태 대시보드",
  description: "실시간 서버 상태 모니터링 대시보드",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          서버 상태 모니터링 대시보드
        </h1>

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-80">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-l-blue-500 border-r-blue-700 animate-spin"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-300">
                  데이터를 불러오는 중...
                </p>
              </div>
            </div>
          }
        >
          <ServerStatusDashboard />
        </Suspense>
      </div>
    </div>
  );
}
