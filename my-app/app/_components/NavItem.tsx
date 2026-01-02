// ナビゲーションバーに含まれる 各ナビゲーションアイテム のコンポーネント

import Link from 'next/link';
import { ReactNode } from 'react';

interface NavItemProps {
    href: string;
    icon: ReactNode;
    label: string;
    isActive: boolean;
}

export default function NavItem({ href, icon, label, isActive }: NavItemProps) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${isActive
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </Link>
    );
}
