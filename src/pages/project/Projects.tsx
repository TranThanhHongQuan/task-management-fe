import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import {
  listProjects,
  createProject,
  deleteProject,
  updateProjectStatus,
} from "../../api/projectApi";
import type { Project } from "../../types/project";
import type { PageResponse } from "../../types/common";

export default function Projects() {
  const nav = useNavigate();

  // ================= FILTERS =================
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  // ================= DATA =================
  const [data, setData] = useState<PageResponse<Project> | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ================= CREATE MODAL =================
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [createStatus, setCreateStatus] = useState("ACTIVE");
  const [creating, setCreating] = useState(false);

  // ================= DELETE MODAL =================
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ================= LOAD =================
  async function load(page = 0) {
    setLoading(true);
    setErr(null);
    try {
      const res = await listProjects({
        page,
        size: 12,
        keyword: keyword || undefined,
        status: status || undefined,
      });
      setData(res);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Không tải được dự án");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================= CREATE =================
  async function submitCreate() {
    setErr(null);
    setCreating(true);
    try {
      await createProject({
        name: name.trim(),
        code: code.trim(),
        description: desc.trim() || undefined,
        status: createStatus,
      });

      setOpen(false);
      setName("");
      setCode("");
      setDesc("");
      setCreateStatus("ACTIVE");

      await load(0);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Tạo dự án thất bại");
    } finally {
      setCreating(false);
    }
  }

  // ================= DELETE =================
  async function confirmDelete() {
    if (!deleteId) return;
    setErr(null);
    setDeleting(true);
    try {
      await deleteProject(deleteId);
      setDeleteId(null);
      await load(data?.page ?? 0);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Xoá project thất bại");
    } finally {
      setDeleting(false);
    }
  }

  const items = useMemo(() => data?.items ?? [], [data]);

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="text-lg font-extrabold text-slate-900">Dự án</div>
        <div className="flex-1" />

        <div className="w-72">
          <Input
            placeholder="Tìm theo tên/mã..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <select
          className="rounded-xl border bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DONE">DONE</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>

        <Button onClick={() => load(0)}>Lọc</Button>
        <Button onClick={() => setOpen(true)}>+ Tạo dự án</Button>
      </div>

      {err && (
        <div className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      {loading && <div className="text-sm text-slate-500">Đang tải...</div>}

      {/* ================= CARDS ================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-bold text-slate-900">{p.name}</div>
                <div className="text-xs text-slate-500">{p.code}</div>
                <div className="mt-2 text-xs text-slate-500">
                  Owner: {p.ownerEmail}
                </div>

                {/* ===== UPDATE STATUS ===== */}
                <select
                  className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  value={p.status}
                  onChange={async (e) => {
                    try {
                      await updateProjectStatus(p.id, e.target.value);
                      await load(data?.page ?? 0);
                    } catch (err: any) {
                      setErr(
                        err?.response?.data?.message ??
                          "Update project status thất bại"
                      );
                    }
                  }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DONE">DONE</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                {p.status}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => nav(`/app/projects/${p.id}/tasks`)}
              >
                Nhiệm vụ
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => nav(`/app/projects/${p.id}/members`)}
              >
                Members
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setDeleteId(p.id)}
              >
                Xoá
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ================= PAGINATION ================= */}
      {data && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <div>
            Tổng: <b className="text-slate-900">{data.totalElements}</b>
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
              Page <b className="text-slate-900">{data.page + 1}</b> /{" "}
              {data.totalPages}
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

      {/* ================= CREATE MODAL ================= */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-soft">
            <div className="flex items-center justify-between border-b p-4">
              <div className="font-extrabold text-slate-900">Tạo dự án</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-1 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 p-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên dự án"
              />
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Mã dự án"
              />
              <textarea
                className="w-full rounded-xl border px-3 py-2 text-sm"
                rows={4}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Mô tả"
              />
              <select
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={createStatus}
                onChange={(e) => setCreateStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DONE">DONE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={submitCreate}
                  disabled={creating || !name.trim() || !code.trim()}
                >
                  {creating ? "Đang tạo..." : "Tạo"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-soft">
            <div className="border-b p-4">
              <div className="font-extrabold text-slate-900">
                Xác nhận xoá dự án
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Bạn chắc chắn muốn xoá project này? (Soft delete)
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                Hủy
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Đang xoá..." : "Xoá"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
