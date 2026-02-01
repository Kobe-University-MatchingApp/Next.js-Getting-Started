import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getProfileById } from '@/lib/profile';

export default async function ProfileIndexPage() {
    const supabase = await createClient();
    
    // ユーザー認証チェック
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        // ログインしていなければログイン画面へ
        redirect('/login');
    }

    // プロフィール情報を取得して、shortIdを得る
    const profile = await getProfileById(user.id);
    
    // ログインしていれば自分のプロフィールページへリダイレクト
    // shortIdがあればそれを使い、なければUUIDを使う（フォールバック）
    const targetId = profile?.shortId || user.id;
    redirect(`/profile/${targetId}`);
}
