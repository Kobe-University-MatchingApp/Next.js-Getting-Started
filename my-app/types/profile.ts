// ユーザープロフィールに関する型定義
export interface Profile {
    id: string;
    shortId?: string; // URL表示用の短いID
    name: string;
    age: number;
    location: string;
    occupation: string;
    bio: string;
    interests: string[];
    images: string[];
    // 言語交換関連
    nativeLanguage: string;
    learningLanguages: string[];
    languageLevel?: {
        [language: string]: 'beginner' | 'intermediate' | 'advanced' | 'native';
    };
    exchangeGoals: string[];
    studyStyle?: string[];
    availability?: string[];
    // その他
    nationality?: string;
    education?: string;
}
