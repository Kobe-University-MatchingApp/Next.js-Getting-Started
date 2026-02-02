'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/profile';
import { getProfileById } from '@/lib/profile';

type UserContextType = {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 初期化時にセッションを取得
        const initializeUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    setUser(session.user);
                    // ユーザーIDに基づいてプロフィールを取得
                    const userProfile = await getProfileById(session.user.id);
                    setProfile(userProfile);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            } catch (error) {
                console.error('Error initializing user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeUser();

        // 認証状態の変更を監視
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                // プロフィールも再取得（必要に応じて）
                if (!profile || profile.id !== session.user.id) {
                     const userProfile = await getProfileById(session.user.id);
                     setProfile(userProfile);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, profile, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
