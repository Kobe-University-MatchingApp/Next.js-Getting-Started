import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from '../_components/ProfileForm';

export default function CreateProfilePage() {
  async function createProfile(formData: FormData) {
    'use server';
    const supabase = await createClient();

    // ユーザー認証チェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 1. 入力値の取得
    const name = formData.get('name') as string;
    const ageStr = formData.get('age') as string;
    const location = formData.get('location') as string;
    const bio = formData.get('bio') as string;
    const occupation = formData.get('occupation') as string;
    const nativeLanguage = formData.get('nativeLanguage') as string;
    const imageFile = formData.get('image') as File;
    
    // JSONデータのパース
    const interestsJson = formData.get('interestsJson') as string;
    const learningLanguagesJson = formData.get('learningLanguagesJson') as string;
    
    const interests = interestsJson ? JSON.parse(interestsJson) : [];
    const learningLanguagesRaw = learningLanguagesJson ? JSON.parse(learningLanguagesJson) : [];

    // DB形式への変換
    const learningLanguages = learningLanguagesRaw.map((item: any) => item.language);
    const languageLevel = learningLanguagesRaw.reduce((acc: any, item: any) => {
        acc[item.language] = item.level;
        return acc;
    }, {});

    // 2. バリデーション（必須項目のチェック）
    if (!name || !ageStr || !location || !nativeLanguage) {
        console.error('必須項目が不足しています');
        return;
    }
    const age = parseInt(ageStr);

    // 3. 画像アップロード処理
    let imageUrls: string[] = [];
    if (imageFile && imageFile.size > 0) {
        const fileName = `${user.id}-${Date.now()}-${imageFile.name}`; // ファイル名にユーザーIDを含める
        const { error: uploadError } = await supabase.storage
            .from('profile-images')
            .upload(fileName, imageFile);

        if (uploadError) {
            console.error('Image upload error:', uploadError);
        } else {
            const { data: publicUrlData } = supabase.storage
                .from('profile-images')
                .getPublicUrl(fileName);
            imageUrls.push(publicUrlData.publicUrl);
        }
    }

    // 4. データベースへの保存
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id, // ユーザーIDをプロフィールのIDとして使用
        name,
        age,
        location,
        bio,
        occupation,
        native_language: nativeLanguage,
        images: imageUrls,
        interests: interests,
        learning_languages: learningLanguages,
        language_level: languageLevel,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return;
    }

    if (data) {
      redirect(`/profile/${data.id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10 mb-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">プロフィール作成</h1>
        <p className="text-gray-500 mt-2">あなたの魅力を伝えて、言語交換パートナーを見つけましょう</p>
      </div>
      
      <ProfileForm action={createProfile} />
    </div>
  );
}
