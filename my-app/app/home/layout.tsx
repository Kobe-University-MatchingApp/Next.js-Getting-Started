import AuthenticatedLayout from "@/app/_components/AuthenticatedLayout";

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="w-full px-4">
                    {children}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
