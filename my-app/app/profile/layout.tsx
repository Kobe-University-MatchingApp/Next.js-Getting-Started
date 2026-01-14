// app/profile/layout.tsx
// プロフィールページのレイアウト定義

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="w-full px-4">
                {children}
            </div>
        </div>
    );
}