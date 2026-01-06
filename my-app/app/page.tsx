'use client';

import Link from 'next/link';

export default function Page() {
  return (
    <div className="py-3 space-y-3">
      <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
        <h1 className="text-xl font-bold text-gray-800 mb-2">ようこそ！</h1>
        <p className="text-sm text-gray-600">異文化交流イベント管理アプリ</p>
      </div>

      <div className="flex flex-col gap-3 mx-2 mt-10">
        <Link
          href="/login"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
        >
          <h2 className="text-lg font-bold">ログイン / 新規登録</h2>
          <p className="text-xs mt-1 opacity-90">Googleアカウントで始める</p>
        </Link>
      </div>
    </div>
  );
}