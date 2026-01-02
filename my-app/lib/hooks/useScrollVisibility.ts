import { useState, useEffect } from 'react';

const SCROLL_THRESHOLD = 10;

/**
 * スクロール位置に基づいてフローティングボタンの表示/非表示を制御するカスタムフック
 * 
 * @returns {boolean} フローティングボタンを表示するかどうか
 * 
 * @example
 * ```tsx
 * const showButton = useScrollVisibility();
 * 
 * <button className={showButton ? 'visible' : 'hidden'}>
 *   トップに戻る
 * </button>
 * ```
 */
export function useScrollVisibility() {

    // スクロール位置に基づいてフローティングボタンの表示/非表示を制御
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
