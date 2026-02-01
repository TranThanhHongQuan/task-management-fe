import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Button } from "../ui/Button";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";
import { useEffect, useRef, useState } from "react";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { count } = useUnreadNotifications();

  // ✅ hooks luôn nằm ở đây (trước return điều kiện)
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpenMenu(false);
    };
    const onKeyDown = (e) => e.key === "Escape" && setOpenMenu(false);

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // ✅ return điều kiện đặt sau hooks
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

            {/* Avatar menu */}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setOpenMenu((v) => !v)} className="group">
                <img
                  src={user.avatarUrl || "https://i.pravatar.cc/150?img=3"}
                  alt="avatar"
                  className="h-9 w-9 rounded-full border object-cover shadow-sm group-hover:ring-2 group-hover:ring-brand-500"
                />
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border bg-white shadow-lg">
                  <div className="px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">
                      {user.fullName || "Tài khoản"}
                    </div>
                    <div className="text-xs text-slate-500 break-all">{user.email}</div>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      nav("/app/profile");
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    👤 Profile
                  </button>
                  <button
                    onClick={async () => {
                      setOpenMenu(false);
                      await logout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>

            <Button variant="outline" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
