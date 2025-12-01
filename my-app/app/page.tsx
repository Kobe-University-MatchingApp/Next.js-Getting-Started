export default function Page() {
  return (
    <div className="py-3 space-y-3">
      <div className="bg-white rounded-lg shadow-sm p-4 mx-2">
        <h1 className="text-xl font-bold text-gray-800 mb-2">ようこそ！</h1>
        <p className="text-sm text-gray-600">異文化交流イベント管理アプリ</p>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md p-6 mx-2 text-white">
        <h2 className="text-lg font-bold mb-2">はじめよう</h2>
        <p className="text-sm opacity-90">プロフィール、イベント作成、イベント検索から始めましょう</p>
      </div>
    </div>
  );
}