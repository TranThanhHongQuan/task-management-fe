import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    avatarUrl: "",
  });

  const avatarSrc = useMemo(() => {
    return form.avatarUrl || user?.avatarUrl || "https://i.pravatar.cc/150?img=3";
  }, [form.avatarUrl, user]);

  // Load profile (nếu user từ auth chưa có đủ field hoặc muốn refresh)
  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!token) return;
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/v1/me/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Load profile failed");

        const data = await res.json();
        if (ignore) return;

        setUser(data);
        setForm({
          fullName: data.fullName ?? "",
          phone: data.phone ?? "",
          avatarUrl: data.avatarUrl ?? "",
        });
      } catch (e) {
        if (!ignore) setError("Không tải được profile. Vui lòng đăng nhập lại.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [token, setUser]);

  const onPickAvatarFile = async (file) => {
    if (!file) return;

    // demo preview bằng base64 (production: upload cloud -> url)
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setForm((p) => ({ ...p, avatarUrl: base64 }));
  };

  const save = async () => {
    if (!token) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/v1/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone || null,
          avatarUrl: form.avatarUrl || null,
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Update failed");
      }

      const updated = await res.json();
      setUser(updated);
      setForm({
        fullName: updated.fullName ?? "",
        phone: updated.phone ?? "",
        avatarUrl: updated.avatarUrl ?? "",
      });
    } catch (e) {
      setError("Cập nhật thất bại. Kiểm tra dữ liệu hoặc đăng nhập lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-extrabold text-slate-900">Hồ sơ cá nhân</div>
            <div className="mt-1 text-sm text-slate-600">
              Cập nhật thông tin hiển thị của bạn.
            </div>
          </div>

          <div className="text-right text-sm text-slate-600">
            <div className="font-semibold text-slate-900">{user?.email}</div>
            <div className="text-xs">Status: {user?.status || "-"}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[160px_1fr]">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={avatarSrc}
              alt="avatar"
              className="h-28 w-28 rounded-full border object-cover shadow-sm"
            />
            <label className="w-full cursor-pointer rounded-xl border bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Chọn ảnh
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickAvatarFile(e.target.files?.[0])}
              />
            </label>
            <div className="w-full text-xs text-slate-500">
              *Demo đang preview base64. Thực tế nên upload Cloud/S3 để lấy URL.
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <Field
              label="Họ tên"
              value={form.fullName}
              onChange={(v) => setForm((p) => ({ ...p, fullName: v }))}
              placeholder="Nhập họ tên"
            />

            <Field
              label="Số điện thoại"
              value={form.phone}
              onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
              placeholder="VD: 0912345678"
            />

            <Field
              label="Avatar URL (tuỳ chọn)"
              value={form.avatarUrl}
              onChange={(v) => setForm((p) => ({ ...p, avatarUrl: v }))}
              placeholder="https://..."
            />

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-slate-500">
                {loading ? "Đang tải..." : " "}
              </div>

              <button
                disabled={saving}
                onClick={save}
                className="rounded-xl bg-black px-4 py-2 text-sm font-extrabold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <input
        className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
