'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useModal } from '@/app/contexts/ModalContext';

export default function BottomNav() {
    const pathname = usePathname();
    const { isModalOpen } = useModal();

    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path);
    };

    return (
        <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom transition-transform duration-300 ${isModalOpen ? 'translate-y-full' : 'translate-y-0'}`}>
            <div className="flex justify-around items-center h-16 max-w-screen-sm mx-auto px-2">
                <Link
                    href="/create"
                    className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${isActive('/create')
                        ? 'text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <svg
                        className="w-6 h-6 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    <span className="text-xs font-medium">作る</span>
                </Link>

                <Link
                    href="/home"
                    className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${isActive('/home')
                        ? 'text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <svg
                        className="w-6 h-6 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                    <span className="text-xs font-medium">ホーム</span>
                </Link>

                <Link
                    href="/find"
                    className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${isActive('/find')
                        ? 'text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <svg
                        className="w-6 h-6 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <span className="text-xs font-medium">探す</span>
                </Link>

                <Link
                    href="/profile"
                    className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${isActive('/profile')
                        ? 'text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <svg
                        className="w-6 h-6 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                    <span className="text-xs font-medium">プロフィール</span>
                </Link>
            </div>
        </nav>
    );
}
