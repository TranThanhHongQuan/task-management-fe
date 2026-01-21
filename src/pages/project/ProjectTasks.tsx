import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { createTask, listTasks, updateTaskStatus } from "../../api/taskApi";
import type { PageResponse } from "../../types/common";
import type { Task } from "../../types/task";

/* ================= BADGE ================= */

function Badge({ text }: { text: string }) {
  const cls =
    text.includes("DONE")
      ? "bg-emerald-100 text-emerald-700"
      : text.includes("OVERDUE")
        ? "bg-red-100 text-red-700"
        : text.includes("IN_PROGRESS")
          ? "bg-brand-100 text-brand-700"
          : "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${cls}`}>
      {text}
    </span>
  );
}

/* ================= PAGE ================= */

export default function ProjectTasks() {
  const { projectId } = useParams();
  const pid = Number(projectId);

  /* ===== FILTERS ===== */
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  /* ===== DATA ===== */
  const [data, setData] = useState<PageResponse<Task> | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* ===== CREATE MODAL ===== */
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [newStatus, setNewStatus] = useState("TODO");
  const [newPriority, setNewPriority] = useState("MEDIUM");
  const [deadline, setDeadline] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");

  /* ================= LOAD ================= */

  async function load(page = 0) {
    setLoading(true);
    setErr(null);
    try {
      const res = await listTasks({
        projectId: pid,
        page,
        size: 10,
        keyword: keyword || undefined,
        status: status || undefined,
        priority: priority || undefined,
      });
      setData(res);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Không tải được nhiệm vụ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(pid)) return;
    load(0);
  }, [pid]);

  /* ================= CREATE ================= */

  async function submitCreate() {
    setErr(null);
    try {
      await createTask({
        projectId: pid,
        title,
        description: desc || undefined,
        status: newStatus,
        priority: newPriority,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        assigneeEmail: assigneeEmail.trim() ? assigneeEmail.trim() : undefined,
      });

      // reset form
      setOpen(false);
      setTitle("");
      setDesc("");
      setDeadline("");
      setAssigneeEmail("");
      setNewStatus("TODO");
      setNewPriority("MEDIUM");
      setAssigneeEmail("");

      await load(0);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Tạo task thất bại");
    }
  }

  const rows = useMemo(() => data?.items ?? [], [data]);

  /* ================= UI ================= */

  return (
    <div>
      {/* ===== HEADER ===== */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="text-lg font-extrabold text-slate-900">
          Quản lý nhiệm vụ (Project #{pid})
        </div>
        <div className="flex-1" />

        <div className="w-72">
          <Input
            placeholder="Tìm task..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <select
          className="rounded-xl border bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tất cả status</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
          <option value="REJECTED">REJECTED</option>
          <option value="OVERDUE">OVERDUE</option>
        </select>

        <select
          className="rounded-xl border bg-white px-3 py-2 text-sm"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">Tất cả priority</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <Button onClick={() => load(0)}>Lọc</Button>
        <Button onClick={() => setOpen(true)}>+ Thêm nhiệm vụ</Button>
      </div>

      {err && (
        <div className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading && (
        <div className="text-sm text-slate-500">Đang tải...</div>
      )}

      {/* ===== TABLE ===== */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Nhiệm vụ</th>
              <th className="px-4 py-3 text-left">Assignee</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {t.title}
                </td>
                <td className="px-4 py-3">
                  {t.assigneeEmail ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-xl border bg-white px-3 py-2 text-sm"
                    value={t.status}
                    onChange={async (e) => {
                      try {
                        await updateTaskStatus(t.id, e.target.value);
                        await load(data?.page ?? 0);
                      } catch (err: any) {
                        setErr(
                          err?.response?.data?.message ??
                          "Update status thất bại"
                        );
                      }
                    }}
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <Badge text={t.priority} />
                </td>
                <td className="px-4 py-3">
                  {t.deadline
                    ? new Date(t.deadline).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* ===== PAGINATION ===== */}
      {data && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <div>
            Tổng:{" "}
            <b className="text-slate-900">
              {data.totalElements}
            </b>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={data.page === 0}
              onClick={() => load(data.page - 1)}
            >
              Prev
            </Button>
            <div>
              Page{" "}
              <b className="text-slate-900">
                {data.page + 1}
              </b>{" "}
              / {data.totalPages}
            </div>
            <Button
              variant="outline"
              disabled={data.page + 1 >= data.totalPages}
              onClick={() => load(data.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ===== CREATE MODAL ===== */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-soft">
            <div className="flex items-center justify-between border-b p-4">
              <div className="font-extrabold text-slate-900">
                Tạo nhiệm vụ
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-1 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 p-4">
              <Input
                placeholder="Tiêu đề"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <textarea
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                rows={4}
                placeholder="Mô tả"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />

              <div>
                <div className="mb-1 text-xs font-bold text-slate-500">
                  Assignee Email (optional)
                </div>
                <Input
                  value={assigneeEmail}
                  onChange={(e) => setAssigneeEmail(e.target.value)}
                  placeholder="member@local.com"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <select
                  className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>

                <select
                  className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>

                <Input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={submitCreate}
                  disabled={!title.trim()}
                >
                  Lưu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
