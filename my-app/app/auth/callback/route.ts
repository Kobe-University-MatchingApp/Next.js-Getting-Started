import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // ユーザー情報の取得
      const { data: { user } } = await supabase.auth.getUser()
      
      // ドメインチェック (神戸大学のドメインか確認)
      // ※ 本番環境ではSupabaseのAuth設定で制限することも可能ですが、
      //    コードベースで明示的にチェックすることでより確実になります。
      //    テスト用に gmail.com も許可したい場合はここを調整してください。
      const email = user?.email || ''
      const isKobeU = email.endsWith('kobe-u.ac.jp') || email.endsWith('stu.kobe-u.ac.jp')
      
      // ★開発中はテストしやすくするため、一旦すべてのGoogleアカウントを許可する場合はここをコメントアウト
      // if (!isKobeU) {
      //   await supabase.auth.signOut()
      //   return NextResponse.redirect(`${origin}/login?error=unauthorized_domain`)
      // }

      // プロフィールが存在するか確認
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user?.id) // user.id と profile.id を一致させる設計に変更
        .single()

      if (profile) {
        // プロフィールがあればホームまたは指定されたページへ
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        // プロフィールがなければ作成画面へ
        return NextResponse.redirect(`${origin}/profile/create`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
