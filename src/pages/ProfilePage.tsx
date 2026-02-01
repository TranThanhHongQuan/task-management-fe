import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { storage } from "../core/storage";
import { updateMeProfile } from "../auth/meApi";

type ProfileForm = {
  fullName: string;
  phone: string;
  avatarUrl: string;
};

export default function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const token = storage.get()?.accessToken;

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    phone: "",
    avatarUrl: "",
  });

  // Load profile về AuthContext (merge perms + profile)
  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!token) return;
      setLoading(true);
      setError("");

      try {
        await refreshMe();
      } catch {
        if (!ignore) setError("Không tải được profile. Vui lòng đăng nhập lại.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [token, refreshMe]);

  // Đổ user -> form (mỗi khi refreshMe cập nhật user)
  useEffect(() => {
    setForm({
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      avatarUrl: user?.avatarUrl ?? "",
    });
  }, [user?.fullName, user?.phone, user?.avatarUrl]);

  const avatarSrc = useMemo(() => {
    return form.avatarUrl || user?.avatarUrl || "https://i.pravatar.cc/150?img=3";
  }, [form.avatarUrl, user?.avatarUrl]);

  const onPickAvatarFile = async (file?: File) => {
    if (!file) return;

    const base64 = await new Promise<string>((resolve, reject) => {
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
      await updateMeProfile(token, {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
      });

      // refresh lại context để header/avatar update ngay
      await refreshMe();
    } catch {
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
            <div className="mt-1 text-sm text-slate-600">Cập nhật thông tin hiển thị của bạn.</div>
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
              *Nếu bạn chưa có upload backend, hãy dùng Avatar URL hoặc upload Cloud/S3 lấy link.
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
              label="Avatar URL"
              value={form.avatarUrl}
              onChange={(v) => setForm((p) => ({ ...p, avatarUrl: v }))}
              placeholder="https://..."
            />

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-slate-500">{loading ? "Đang tải..." : " "}</div>

              <button
                disabled={saving || loading}
                onClick={save}
                className="rounded-xl bg-black px-4 py-2 text-sm font-extrabold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>

            {!token && (
              <div className="text-sm font-semibold text-red-600">
                Không tìm thấy accessToken. Bạn cần đăng nhập lại.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
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
