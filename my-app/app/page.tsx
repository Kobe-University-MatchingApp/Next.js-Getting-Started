'use client';

import { useState } from 'react';
import AuthModal from './_components/AuthModal';

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsModalOpen(true);
  };

  return (
    <div className="py-3 space-y-3">
      <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
        <h1 className="text-xl font-bold text-gray-800 mb-2">ようこそ！</h1>
        <p className="text-sm text-gray-600">異文化交流イベント管理アプリ</p>
      </div>

      <div className="flex gap-2 mx-2">
        <button
          onClick={() => openModal('login')}
          className="flex-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <h2 className="text-lg font-bold">ログイン</h2>
        </button>
        <button
          onClick={() => openModal('signup')}
          className="flex-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <h2 className="text-lg font-bold">サインアップ</h2>
        </button>
      </div>

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}