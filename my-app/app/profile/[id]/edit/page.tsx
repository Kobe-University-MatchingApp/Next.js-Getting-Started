import { createClient } from '@/utils/supabase/server';
import { getProfileById, getProfileByShortId } from '@/lib/profile';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import ProfileForm from '../../_components/ProfileForm';
import { logger } from '@/lib/utils/logger';

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // UUID形式かどうかの簡易チェック
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const supabase = await createClient();

    // プロフィールデータを取得
    let profile = await getProfileByShortId(id);
    if (!profile && isUuid) {
        profile = await getProfileById(id);
    }

    if (!profile) {
        return notFound();
    }

    // 認証チェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 本人確認（自分のプロフィール以外は編集できない）
    // profile.id は常にUUIDなので、user.idと比較できる
    if (user.id !== profile.id) {
        // IDが違う場合はプロフィールページへ戻す（URLはパラメータのまま）
        redirect(`/profile/${id}`);
    }

    async function updateProfile(formData: FormData) {
        'use server';
        const supabase = await createClient(); // サーバーアクション内でもクライアントを作成

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
        const exchangeGoalsJson = formData.get('exchangeGoalsJson') as string;

        const interests = interestsJson ? JSON.parse(interestsJson) : [];
        const learningLanguagesRaw = learningLanguagesJson ? JSON.parse(learningLanguagesJson) : [];
        const exchangeGoals = exchangeGoalsJson ? JSON.parse(exchangeGoalsJson) : [];

        // DB形式への変換
        const learningLanguages = learningLanguagesRaw.map((item: any) => item.language);
        const languageLevel = learningLanguagesRaw.reduce((acc: any, item: any) => {
            acc[item.language] = item.level;
            return acc;
        }, {});

        if (!name || !ageStr || !location || !nativeLanguage) {
            logger.error('必須項目が不足しています');
            return;
        }
        const age = parseInt(ageStr);

        let imageUrls = profile?.images || [];

        // 新しい画像がアップロードされた場合
        if (imageFile && imageFile.size > 0) {
            const fileName = `${user?.id}-${Date.now()}-${imageFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('profile-images')
                .upload(fileName, imageFile);

            if (!uploadError) {
                const { data: publicUrlData } = supabase.storage
                    .from('profile-images')
                    .getPublicUrl(fileName);
                // 既存の画像を置き換えるか、追加するか。今回は先頭に追加してメイン画像とする
                imageUrls = [publicUrlData.publicUrl, ...imageUrls];
            } else {
                logger.error('Image upload error:', uploadError);
            }
        }

        // profile.id は常にUUIDなので、これを使用する（idはshortIdの可能性がある）
        const profileUuid = profile?.id;

        const { data: updateData, error } = await supabase
            .from('profiles')
            .update({
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
                exchange_goals: exchangeGoals,
            })
            .eq('id', profileUuid)
            .select(); // 更新されたデータを取得して確認

        if (error) {
            logger.error('Error updating profile (Supabase):', error);
            return;
        }

        // 更新件数チェック
        if (!updateData || updateData.length === 0) {
            logger.error('Update Warning: No rows were updated');
        }

        revalidatePath(`/profile/${id}`);
        redirect(`/profile/${id}`);
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10 mb-20">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">プロフィール編集</h1>
                <p className="text-gray-500 mt-2">情報を更新して、より良いマッチングを目指しましょう</p>
            </div>

            <ProfileForm initialData={profile} action={updateProfile} />
        </div>
    );
}
