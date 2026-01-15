import { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { listNotifications, markRead, markReadAll } from "../api/notificationApi";
import type { Notification } from "../types/notification";
import type { PageResponse } from "../types/common";

function TypeBadge({ t }: { t: string }) {
  const cls =
    t.includes("ASSIGNED") ? "bg-brand-100 text-brand-700"
    : t.includes("STATUS") ? "bg-amber-100 text-amber-700"
    : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{t}</span>;
}

export default function Notifications() {
  const [keyword, setKeyword] = useState("");
  const [isRead, setIsRead] = useState<string>(""); // "", "true", "false"
  const [type, setType] = useState("");
  const [data, setData] = useState<PageResponse<Notification> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(page = 0) {
    setLoading(true);
    setErr(null);
    try {
      const res = await listNotifications({
        page,
        size: 10,
        keyword: keyword || undefined,
        type: type || undefined,
        isRead: isRead === "" ? undefined : isRead === "true",
      });
      setData(res);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Không tải được notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(0); }, []);

  async function onRead(id: number) {
    await markRead(id);
    await load(data?.page ?? 0);
  }

  async function onReadAll() {
    await markReadAll();
    await load(0);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="text-lg font-extrabold text-slate-900">Thông báo</div>
        <div className="flex-1" />
        <div className="w-72"><Input placeholder="Tìm..." value={keyword} onChange={(e)=>setKeyword(e.target.value)} /></div>

        <select className="rounded-xl border bg-white px-3 py-2 text-sm" value={isRead} onChange={(e)=>setIsRead(e.target.value)}>
          <option value="">Tất cả</option>
          <option value="false">Chưa đọc</option>
          <option value="true">Đã đọc</option>
        </select>

        <select className="rounded-xl border bg-white px-3 py-2 text-sm" value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="">Tất cả loại</option>
          <option value="TASK_ASSIGNED">TASK_ASSIGNED</option>
          <option value="TASK_STATUS_CHANGED">TASK_STATUS_CHANGED</option>
          <option value="PROJECT_MEMBER_ADDED">PROJECT_MEMBER_ADDED</option>
        </select>

        <Button onClick={()=>load(0)}>Lọc</Button>
        <Button variant="outline" onClick={onReadAll}>Đánh dấu đọc hết</Button>
      </div>

      {err && <div className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      {loading && <div className="text-sm text-slate-500">Đang tải...</div>}

      <div className="space-y-3">
        {(data?.items ?? []).map(n => (
          <Card key={n.id} className={`p-4 ${n.isRead ? "opacity-80" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <TypeBadge t={n.type} />
                  {!n.isRead && <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">NEW</span>}
                </div>
                <div className="mt-2 font-bold text-slate-900">{n.title}</div>
                <div className="mt-1 text-sm text-slate-700">{n.content}</div>
                <div className="mt-2 text-xs text-slate-500">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {!n.isRead && <Button onClick={()=>onRead(n.id)}>Đánh dấu đã đọc</Button>}
              </div>
            </div>
          </Card>
        ))}
      </div>

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
