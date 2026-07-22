import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-bg-base">
      <Sidebar />
      <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
