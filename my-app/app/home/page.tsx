export default function HomePage() {
    return (
        <div className="py-3 space-y-3">
            {/* アプリタイトル */}
            <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
                <h1 className="text-xl font-bold text-gray-800 mb-2">アプリタイトル - ホーム</h1>
                <p className="text-sm text-gray-600">異文化交流イベント管理アプリ</p>
            </div>

            {/* マッチング結果 */}
            <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">マッチングしたおすすめなイベント</h2>
            </div>

            {/* 予約済みイベント */}
            <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">予約済みイベント</h2>
            </div>
        </div>
    );
}
