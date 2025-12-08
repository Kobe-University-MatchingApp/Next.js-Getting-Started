'use client';

import { use, useState } from 'react';
import { sampleEvents } from '@/data/events';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const event = sampleEvents.find((e) => e.id === id);

  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) return <div className="p-8 text-center">イベントが見つかりません</div>;

  const handleConfirm = async () => {
    if (!isAgreed) return;

    setIsSubmitting(true);

    // ここでAPI通信などを行う想定（今回は擬似的に1.5秒待機）
    await new Promise(resolve => setTimeout(resolve, 1500));

    alert(`「${event.title}」への参加が確定しました！`);
    
    // 完了後の遷移先（マイページやホームなど）
    router.push('/home'); 
  };

  return (
    // ★修正1: 余白を pb-32 から pb-48 に増やして、スクロール末尾が隠れないようにする
    <div className="max-w-2xl mx-auto bg-gray-50 min-h-screen pb-48">
      {/* --- ヘッダー --- */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <Link href={`/find/${event.id}`} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 ml-2">参加申し込み</h1>
      </div>

      <div className="p-6 space-y-6">
        
        {/* --- 申し込みイベント確認カード --- */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 mb-2">申し込みイベント</h2>
          <div className="flex gap-4">
            <img 
              src={event.images?.[0] ?? 'https://placehold.jp/100x100.png'} 
              alt="event" 
              className="w-20 h-20 object-cover rounded-lg bg-gray-100 shrink-0"
            />
            <div>
              <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1">{event.title}</h3>
              <p className="text-xs text-gray-500 mb-1">📅 {event.date} {event.time}</p>
              <p className="text-sm font-bold text-purple-600">¥{(event.fee ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* --- 同意文（スクロールエリア） --- */}
        <section>
          <h2 className="text-sm font-bold text-gray-700 mb-2">イベント参加規約</h2>
          <div className="bg-white p-4 rounded-xl border border-gray-200 h-64 overflow-y-auto text-sm text-gray-600 leading-relaxed shadow-inner">
            <p className="font-bold mb-2">第1条（目的）</p>
            <p className="mb-4">本イベントは、参加者同士の交流および異文化理解を深めることを目的としています。</p>
            
            <p className="font-bold mb-2">第2条（禁止事項）</p>
            <p className="mb-4">以下の行為を禁止します。<br/>
            ・ネットワークビジネス、宗教、保険等の勧誘行為<br/>
            ・他の参加者への迷惑行為、ハラスメント<br/>
            ・イベントの運営を妨害する行為<br/>
            ・無断でのキャンセル（無断キャンセルが続く場合、利用を制限することがあります）</p>

            <p className="font-bold mb-2">第3条（個人情報の取り扱い）</p>
            <p className="mb-4">取得した個人情報は、本イベントの運営および連絡のみに使用し、第三者に提供することはありません。</p>

            <p className="font-bold mb-2">第4条（免責事項）</p>
            <p className="mb-4">イベント中に発生したトラブル、盗難、怪我等について、主催者は一切の責任を負いません。貴重品はご自身で管理してください。</p>
            
            <p className="text-xs text-gray-400 mt-4">以上、本規約に同意の上ご参加ください。</p>
          </div>
        </section>

        {/* --- チェックボックス --- */}
        <section className="bg-white p-4 rounded-xl border border-gray-100">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                className="peer sr-only" 
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
              />
              <div className={`w-6 h-6 border-2 rounded-md transition-all flex items-center justify-center
                ${isAgreed 
                  ? 'bg-purple-600 border-purple-600' 
                  : 'bg-white border-gray-300 group-hover:border-purple-400'
                }`}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <span className="text-sm text-gray-700 select-none">
              <span className="font-bold text-gray-900">注意事項・利用規約</span>の内容を確認し、同意します。
            </span>
          </label>
        </section>

      </div>

      {/* --- 確定ボタン（固定フッター） --- */}
      {/* ★修正2: bottom-0 を bottom-16 に変更して、BottomNavの上に配置 */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-bottom z-50">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleConfirm}
            disabled={!isAgreed || isSubmitting}
            className={`w-full font-bold py-4 px-6 rounded-full shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
              ${isAgreed && !isSubmitting
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:brightness-110' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                処理中...
              </>
            ) : (
              '参加を確定する'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}