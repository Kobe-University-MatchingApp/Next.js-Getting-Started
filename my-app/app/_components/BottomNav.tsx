// 画面下部のナビゲーションバーのコンポーネント

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useModal } from '@/app/_contexts/ModalContext';
import NavItem from './NavItem';
import { PlusIcon, HomeIcon, SearchIcon, UserIcon } from './icons/NavIcons';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { isModalOpen } = useModal();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path);
    };

    // ユーザーアバターを取得
    useEffect(() => {
        const getAvatar = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.avatar_url) {
                setAvatarUrl(user.user_metadata.avatar_url);
            }
        };
        getAvatar();

        // 認証状態の変更を監視してアバターを更新（ログイン・ログアウト時など）
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
             if (session?.user?.user_metadata?.avatar_url) {
                 setAvatarUrl(session.user.user_metadata.avatar_url);
             } else {
                 setAvatarUrl(null);
             }
        });

        return () => subscription.unsubscribe();
    }, []);

    // メニュー外クリックで閉じる
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsMenuOpen(false);
        router.replace('/');
        router.refresh();
    };

    const navItems = [
        { href: '/create', icon: <PlusIcon className="w-6 h-6 mb-1" />, label: '作る' },
        { href: '/home', icon: <HomeIcon className="w-6 h-6 mb-1" />, label: 'ホーム' },
        { href: '/find', icon: <SearchIcon className="w-6 h-6 mb-1" />, label: '探す' },
        { href: '/profile', icon: <UserIcon className="w-6 h-6 mb-1" />, label: 'プロフィール' },
    ];

    return (
        <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom transition-transform duration-300 ${isModalOpen ? 'translate-y-full' : 'translate-y-0'}`}>
            <div className="flex justify-around items-center h-16 max-w-screen-sm mx-auto px-2 relative">
                {navItems.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        isActive={isActive(item.href)}
                    />
                ))}

                {/* アバターメニューボタン */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex flex-col items-center justify-center w-16 h-full text-gray-400 hover:text-purple-600 transition-colors"
                    >
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 mb-1">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">マイページ</span>
                    </button>

                    {/* ポップアップメニュー */}
                    {isMenuOpen && (
                        <div className="absolute bottom-full right-0 mb-3 w-32 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                ログアウト
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
