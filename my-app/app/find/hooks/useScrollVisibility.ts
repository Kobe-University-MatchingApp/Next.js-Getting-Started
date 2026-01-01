import { useState, useEffect } from 'react';

const SCROLL_THRESHOLD = 10;

export function useScrollVisibility() {
    const [showFloatingButton, setShowFloatingButton] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < SCROLL_THRESHOLD) {
                // 最上部付近では常に表示
                setShowFloatingButton(true);
            } else if (currentScrollY > lastScrollY) {
                // 下スクロール時は非表示
                setShowFloatingButton(false);
            } else {
                // 上スクロール時は表示
                setShowFloatingButton(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return showFloatingButton;
}
