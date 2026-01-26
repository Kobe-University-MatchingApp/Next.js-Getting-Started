import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfileIndexPage() {
    const supabase = await createClient();
    
    // ユーザー認証チェック
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        // ログインしていなければログイン画面へ
        redirect('/login');
    }
    
    // ログインしていれば自分のプロフィールページへリダイレクト
    redirect(`/profile/${user.id}`);
}
