import AuthenticatedLayout from "@/app/_components/AuthenticatedLayout";

// NOTE(DB/Supabase placeholder):
// This route segment can later host providers (auth/session) required for Supabase.
// Planned DB targets (Supabase Postgres): schema "create_event", table "created_data".
// For now, we only reserve the position here to avoid touching other folders.

export default function CreateEventLayout({
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
