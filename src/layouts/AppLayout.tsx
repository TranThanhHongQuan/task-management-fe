import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Button } from "../ui/Button";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { count } = useUnreadNotifications();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/app/projects" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-brand-600 shadow-soft" />
            <div className="font-extrabold text-slate-900">QuanSky</div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <button
              onClick={() => nav("/app/notifications")}
              className="relative rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              title="Notifications"
            >
              🔔
              {count > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-extrabold text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>

            <div className="text-sm text-slate-600">{user.email}</div>
            <Button variant="outline" onClick={logout}>Đăng xuất</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
