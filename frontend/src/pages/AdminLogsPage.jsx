import { useDeferredValue, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../api/adminApi";

const formatTimestamp = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, count: 0 });

  const deferredAction = useDeferredValue(action);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getLogs({
          page,
          pageSize: 12,
          action: deferredAction.trim() || undefined,
        });
        setLogs(data?.logs || []);
        setPagination({
          page: data?.page || 1,
          totalPages: data?.totalPages || 1,
          count: data?.count || 0,
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Unable to load admin logs.");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [deferredAction, page]);

  useEffect(() => {
    setPage(1);
  }, [deferredAction]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <h1 className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">
          Admin Activity Logs
        </h1>
        <p className="mt-2 text-sm text-emerald-900/70 dark:text-emerald-100/70">
          Audit trail for moderation and platform governance actions.
        </p>
      </section>

      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <input
          type="text"
          value={action}
          onChange={(event) => setAction(event.target.value)}
          placeholder="Filter by action type"
          className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
        />
      </section>

      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
            Audit History
          </h2>
          <span className="text-xs font-semibold text-emerald-700/75 dark:text-emerald-300/75">
            {pagination.count} records
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
            No log entries found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-200 dark:border-emerald-900/40">
                  <th className="pb-3 pr-4 font-semibold text-emerald-900 dark:text-emerald-100">
                    Action
                  </th>
                  <th className="pb-3 pr-4 font-semibold text-emerald-900 dark:text-emerald-100">
                    Admin
                  </th>
                  <th className="pb-3 pr-4 font-semibold text-emerald-900 dark:text-emerald-100">
                    Target
                  </th>
                  <th className="pb-3 font-semibold text-emerald-900 dark:text-emerald-100">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-emerald-100 dark:border-emerald-900/30">
                    <td className="py-4 pr-4 text-emerald-900 dark:text-emerald-100">
                      {log.action}
                    </td>
                    <td className="py-4 pr-4 text-emerald-800 dark:text-emerald-200">
                      {log.admin_id?.name || "Unknown admin"}
                    </td>
                    <td className="py-4 pr-4 text-emerald-800/80 dark:text-emerald-200/80">
                      {log.target_user_id?.name ||
                        log.target_opportunity_id?.title ||
                        "Platform"}
                    </td>
                    <td className="py-4 text-emerald-700/80 dark:text-emerald-300/80">
                      {formatTimestamp(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300"
          >
            Previous
          </button>
          <span className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPage((prev) => Math.min(pagination.totalPages, prev + 1))
            }
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminLogsPage;
