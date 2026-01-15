import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import {
  addMemberByEmail,
  listMembers,
  removeMember,
} from "../api/memberApi";
import type { ProjectMember } from "../api/memberApi";

export default function ProjectMembers() {
  const { projectId } = useParams();
  const pid = Number(projectId);

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MEMBER" | "MANAGER">("MEMBER");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!pid) return;

    setLoading(true);
    setErr(null);
    try {
      const data = await listMembers(pid);
      setMembers(data);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Không tải được members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [pid]);

  async function onAdd() {
    if (!email.trim()) return;

    setErr(null);
    try {
      await addMemberByEmail(pid, {
        email: email.trim(),
        projectRole: role,
      });
      setEmail("");
      setRole("MEMBER");
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Add member thất bại");
    }
  }

  async function onRemove(userId: number) {
    if (!confirm("Bạn có chắc muốn xoá thành viên này khỏi project?")) return;

    try {
      await removeMember(pid, userId);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Xoá member thất bại");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="text-lg font-extrabold text-slate-900">
          Thành viên dự án #{pid}
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading && (
        <div className="mb-3 text-sm text-slate-500">Đang tải...</div>
      )}

      {/* ADD MEMBER */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-1 text-xs font-bold text-slate-500">
              Email thành viên
            </div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="VD: member@local.com"
            />
          </div>

          <div>
            <div className="mb-1 text-xs font-bold text-slate-500">Role</div>
            <select
              className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "MEMBER" | "MANAGER")
              }
            >
              <option value="MEMBER">MEMBER</option>
              <option value="MANAGER">MANAGER</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={onAdd}
              disabled={!email.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      </Card>

      {/* MEMBER LIST */}
      <Card className="mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.userId} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">
                    {m.email}
                  </div>
                  <div className="text-xs text-slate-500">
                    ID: {m.userId}
                  </div>
                </td>
                <td className="px-4 py-3">{m.projectRole}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    onClick={() => onRemove(m.userId)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}

            {members.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Chưa có thành viên
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
