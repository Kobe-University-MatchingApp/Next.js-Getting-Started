// 认证后页面的布局组件（包含底部导航栏）
import BottomNav from "./BottomNav";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pb-16">
        {children}
      </div>
      <BottomNav />
    </>
  );
}

