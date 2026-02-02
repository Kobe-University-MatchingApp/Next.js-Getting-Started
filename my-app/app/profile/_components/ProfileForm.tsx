'use client';

import { useState } from 'react';
import { Profile } from '@/types/profile';
import { INTERESTS, LANGUAGES, LANGUAGE_LEVELS, OCCUPATIONS, EXCHANGE_GOALS } from '@/lib/constants';

interface ProfileFormProps {
    initialData?: Profile;
    action: (formData: FormData) => Promise<void>;
}

export default function ProfileForm({ initialData, action }: ProfileFormProps) {
    // 趣味の選択状態
    const [selectedInterests, setSelectedInterests] = useState<string[]>(initialData?.interests || []);
    // カスタム趣味の入力状態
    const [customInterest, setCustomInterest] = useState('');
    const [showCustomInterestInput, setShowCustomInterestInput] = useState(false);
    
    // 交流目的の選択状態
    const [selectedGoals, setSelectedGoals] = useState<string[]>(initialData?.exchangeGoals || []);
    // カスタム交流目的の入力状態
    const [customGoal, setCustomGoal] = useState('');
    const [showCustomGoalInput, setShowCustomGoalInput] = useState(false);
    
    // 学習言語の選択状態
    // 初期データがある場合は、learningLanguages配列とlanguageLevelオブジェクトから復元する
    const initialLearningLanguages = initialData?.learningLanguages.map(lang => ({
        language: lang,
        level: initialData.languageLevel?.[lang] || 'beginner'
    })) || [];
    
    const [learningLanguages, setLearningLanguages] = useState<{ language: string, level: string }[]>(initialLearningLanguages);

    // 画像プレビュー
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.images?.[0] || null);

    // 趣味のトグル
    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    // カスタム趣味を追加
    const addCustomInterest = () => {
        const trimmed = customInterest.trim();
        if (trimmed && !selectedInterests.includes(trimmed)) {
            setSelectedInterests([...selectedInterests, trimmed]);
            setCustomInterest('');
            setShowCustomInterestInput(false);
        }
    };

    // 交流目的のトグル
    const toggleGoal = (goal: string) => {
        if (selectedGoals.includes(goal)) {
            setSelectedGoals(selectedGoals.filter(g => g !== goal));
        } else {
            setSelectedGoals([...selectedGoals, goal]);
        }
    };

    // カスタム交流目的を追加
    const addCustomGoal = () => {
        const trimmed = customGoal.trim();
        if (trimmed && !selectedGoals.includes(trimmed)) {
            setSelectedGoals([...selectedGoals, trimmed]);
            setCustomGoal('');
            setShowCustomGoalInput(false);
        }
    };

    // 学習言語の追加
    const addLearningLanguage = () => {
        setLearningLanguages([...learningLanguages, { language: LANGUAGES[0], level: 'beginner' }]);
    };

    // 学習言語の削除
    const removeLearningLanguage = (index: number) => {
        const newLanguages = [...learningLanguages];
        newLanguages.splice(index, 1);
        setLearningLanguages(newLanguages);
    };

    // 学習言語の変更
    const updateLearningLanguage = (index: number, field: 'language' | 'level', value: string) => {
        const newLanguages = [...learningLanguages];
        newLanguages[index] = { ...newLanguages[index], [field]: value };
        setLearningLanguages(newLanguages);
    };

    // 画像選択時のプレビュー処理
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form action={action} className="space-y-8">
            {/* 隠しフィールド：複雑なデータをJSON文字列として送信 */}
            <input type="hidden" name="interestsJson" value={JSON.stringify(selectedInterests)} />
            <input type="hidden" name="learningLanguagesJson" value={JSON.stringify(learningLanguages)} />
            <input type="hidden" name="exchangeGoalsJson" value={JSON.stringify(selectedGoals)} />

            {/* 画像アップロード */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">プロフィール画像</label>
                <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 bg-gray-100 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-400">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        )}
                    </div>
                    <input 
                        name="image" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
            </div>

            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名前 <span className="text-red-500">*</span></label>
                    <input name="name" type="text" defaultValue={initialData?.name} required className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="例: Taro Yamada" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">年齢 <span className="text-red-500">*</span></label>
                    <input name="age" type="number" defaultValue={initialData?.age} required className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="例: 25" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">居住地 <span className="text-red-500">*</span></label>
                    <input name="location" type="text" defaultValue={initialData?.location} required className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="例: Tokyo, Japan" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">職業</label>
                    <select name="occupation" defaultValue={initialData?.occupation} className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white">
                        <option value="">選択してください</option>
                        {OCCUPATIONS.map(occ => (
                            <option key={occ} value={occ}>{occ}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">母国語 <span className="text-red-500">*</span></label>
                    <select name="nativeLanguage" defaultValue={initialData?.nativeLanguage} required className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white">
                        <option value="">選択してください</option>
                        {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 学習言語 */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">学習中の言語</label>
                    <button type="button" onClick={addLearningLanguage} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        言語を追加
                    </button>
                </div>
                
                {learningLanguages.length === 0 && (
                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md text-center">学習中の言語を追加して、言語交換パートナーを見つけましょう！</p>
                )}

                <div className="space-y-3">
                    {learningLanguages.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                            <button type="button" onClick={() => removeLearningLanguage(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">言語</label>
                                    <select 
                                        value={item.language} 
                                        onChange={(e) => updateLearningLanguage(index, 'language', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        {LANGUAGES.map(lang => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">レベル</label>
                                    <select 
                                        value={item.level} 
                                        onChange={(e) => updateLearningLanguage(index, 'level', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        {LANGUAGE_LEVELS.map(level => (
                                            <option key={level.value} value={level.value}>{level.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 趣味・関心 */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">興味・関心（複数選択可）</label>
                    <button 
                        type="button" 
                        onClick={() => setShowCustomInterestInput(!showCustomInterestInput)} 
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        追加
                    </button>
                </div>
                
                {/* カスタム入力フィールド */}
                {showCustomInterestInput && (
                    <div className="flex gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <input
                            type="text"
                            value={customInterest}
                            onChange={(e) => setCustomInterest(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                            placeholder="自由に入力..."
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={addCustomInterest}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            追加
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowCustomInterestInput(false); setCustomInterest(''); }}
                            className="px-3 py-2 text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {/* プリセット趣味 */}
                    {INTERESTS.map(interest => (
                        <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                selectedInterests.includes(interest)
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {interest}
                        </button>
                    ))}
                    {/* カスタム追加された趣味（プリセットにないもの） */}
                    {selectedInterests
                        .filter(interest => !INTERESTS.includes(interest as typeof INTERESTS[number]))
                        .map(interest => (
                            <button
                                key={interest}
                                type="button"
                                onClick={() => toggleInterest(interest)}
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-600 text-white shadow-sm flex items-center gap-1"
                            >
                                {interest}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    ))}
                </div>
            </div>

            {/* 交流目的 */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">交流目的（複数選択可）</label>
                    <button 
                        type="button" 
                        onClick={() => setShowCustomGoalInput(!showCustomGoalInput)} 
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        追加
                    </button>
                </div>
                
                {/* カスタム入力フィールド */}
                {showCustomGoalInput && (
                    <div className="flex gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <input
                            type="text"
                            value={customGoal}
                            onChange={(e) => setCustomGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomGoal())}
                            placeholder="自由に入力..."
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={addCustomGoal}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            追加
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowCustomGoalInput(false); setCustomGoal(''); }}
                            className="px-3 py-2 text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {/* プリセット交流目的 */}
                    {EXCHANGE_GOALS.map(goal => (
                        <button
                            key={goal}
                            type="button"
                            onClick={() => toggleGoal(goal)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                selectedGoals.includes(goal)
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {goal}
                        </button>
                    ))}
                    {/* カスタム追加された交流目的（プリセットにないもの） */}
                    {selectedGoals
                        .filter(goal => !EXCHANGE_GOALS.includes(goal as typeof EXCHANGE_GOALS[number]))
                        .map(goal => (
                            <button
                                key={goal}
                                type="button"
                                onClick={() => toggleGoal(goal)}
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-600 text-white shadow-sm flex items-center gap-1"
                            >
                                {goal}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        ))}
                </div>
                
                {selectedGoals.length === 0 && (
                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md text-center">交流の目的を選択して、マッチングを改善しましょう！</p>
                )}
            </div>

            {/* 自己紹介 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
                <textarea 
                    name="bio" 
                    rows={5} 
                    defaultValue={initialData?.bio} 
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                    placeholder="趣味や学習目標など、自由に書いてみましょう。"
                />
            </div>

            {/* 送信ボタン */}
            <div className="pt-4">
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                    {initialData ? 'プロフィールを更新する' : 'プロフィールを作成する'}
                </button>
                {initialData && (
                    <a href={`/profile/${initialData.id}`} className="block text-center mt-4 text-gray-500 hover:text-gray-700 text-sm">
                        キャンセルして戻る
                    </a>
                )}
            </div>
        </form>
    );
}
