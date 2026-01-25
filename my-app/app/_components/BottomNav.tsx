// 画面下部のナビゲーションバーのコンポーネント

'use client';

import { usePathname } from 'next/navigation';
import { useModal } from '@/app/_contexts/ModalContext';
import { useUser } from '@/app/_contexts/UserContext';
import NavItem from './NavItem';
import { PlusIcon, HomeIcon, SearchIcon, UserIcon } from './icons/NavIcons';

export default function BottomNav() {
    const pathname = usePathname();
    const { isModalOpen } = useModal();
    const { profile } = useUser();

    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path);
    };

    const ProfileIcon = () => {
        if (profile?.images?.[0]) {
            return (
                <div className="w-6 h-6 mb-1 rounded-full overflow-hidden border border-gray-200 relative">
                     <img src={profile.images[0]} alt="Profile" className="w-full h-full object-cover" />
                </div>
            );
        }
        return <UserIcon className="w-6 h-6 mb-1" />;
    };

    const navItems = [
        { href: '/create', icon: <PlusIcon className="w-6 h-6 mb-1" />, label: '作る' },
        { href: '/home', icon: <HomeIcon className="w-6 h-6 mb-1" />, label: 'ホーム' },
        { href: '/find', icon: <SearchIcon className="w-6 h-6 mb-1" />, label: '探す' },
        { href: '/profile', icon: <ProfileIcon />, label: 'プロフィール' },
    ];

    return (
        <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom transition-transform duration-300 ${isModalOpen ? 'translate-y-full' : 'translate-y-0'}`}>
            <div className="flex justify-around items-center h-16 max-w-screen-sm mx-auto px-2">
                {navItems.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        isActive={isActive(item.href)}
                    />
                ))}
            </div>
        </nav>
    );
}
