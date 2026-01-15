import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("Nguyễn Văn A");
  const [email, setEmail] = useState("member@local.com");
  const [password, setPassword] = useState("Member@12345");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register(fullName, email, password);
      nav("/app/projects");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-brand-600 shadow-soft" />
          <div>
            <div className="text-xl font-extrabold text-slate-900">Đăng ký</div>
            <div className="text-sm text-slate-500">Tạo tài khoản mới</div>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <div className="mb-1 text-xs font-bold text-slate-500">Họ và tên</div>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div>
            <div className="mb-1 text-xs font-bold text-slate-500">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <div className="mb-1 text-xs font-bold text-slate-500">Mật khẩu</div>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {err && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

          <Button className="w-full" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link className="font-semibold text-brand-700" to="/login">
            Đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
}
