'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/profile';

interface UserContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                setProfile(null);
            } else if (data) {
                // DBのデータをTypeScriptの型に合わせて変換
                const fetchedProfile: Profile = {
                    id: data.id,
                    name: data.name,
                    age: data.age,
                    location: data.location,
                    occupation: data.occupation,
                    bio: data.bio,
                    interests: data.interests || [],
                    images: data.images || [],
                    nativeLanguage: data.native_language,
                    learningLanguages: data.learning_languages || [],
                    languageLevel: data.language_level as Profile['languageLevel'],
                    exchangeGoals: data.exchange_goals || [],
                    studyStyle: data.study_style || [],
                    availability: data.availability || [],
                    nationality: data.nationality || undefined,
                    education: data.education || undefined,
                };
                setProfile(fetchedProfile);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    useEffect(() => {
        const initializeUser = async () => {
            setIsLoading(true);
            try {
                // 現在のセッションを確認
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                setUser(currentUser);

                if (currentUser) {
                    await fetchProfile(currentUser.id);
                } else {
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    // プロフィールがまだない、またはユーザーが変わった場合に再取得
                    if (!profile || profile.id !== currentUser.id) {
                        await fetchProfile(currentUser.id);
                    }
                } else {
                    setProfile(null);
                }
                setIsLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, profile, isLoading, refreshProfile }}>
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
