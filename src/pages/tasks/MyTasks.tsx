import { useEffect, useState } from "react";
import { myTasks } from "../../api/taskApi";
import type { PageResponse } from "../../types/common";
import type { Task } from "../../types/task";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
export default function MyTasks() {
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState<PageResponse<Task> | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(page = 0) {
    setLoading(true);
    setErr(null);
    try {
      const res = await myTasks({ page, size: 10, keyword: keyword || undefined });
      setData(res);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Không tải được công việc");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(0); }, []);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="text-lg font-extrabold text-slate-900">Công việc của tôi</div>
        <div className="flex-1" />
        <div className="w-72"><Input placeholder="Tìm..." value={keyword} onChange={(e)=>setKeyword(e.target.value)} /></div>
        <Button onClick={()=>load(0)}>Lọc</Button>
      </div>

      {err && <div className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      {loading && <div className="text-sm text-slate-500">Đang tải...</div>}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Task</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map(t => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3 font-semibold text-slate-900">{t.title}</td>
                <td className="px-4 py-3">{t.status}</td>
                <td className="px-4 py-3">{t.priority}</td>
                <td className="px-4 py-3">{t.deadline ? new Date(t.deadline).toLocaleString() : "-"}</td>
              </tr>
            ))}
            {(data?.items?.length ?? 0) === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {data && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <div>Tổng: <b className="text-slate-900">{data.totalElements}</b></div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={data.page === 0} onClick={() => load(data.page - 1)}>Prev</Button>
            <div>Page <b className="text-slate-900">{data.page + 1}</b> / {data.totalPages}</div>
            <Button variant="outline" disabled={data.page + 1 >= data.totalPages} onClick={() => load(data.page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
