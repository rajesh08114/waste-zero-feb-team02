import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutList, MapPin, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { opportunityApi } from "../api/opportunityApi";
import { useAppStore } from "../store/useAppStore";

const PAGE_SIZE = 6;

const statusBadgeClass = (status) => {
  if (status === "closed") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
  }
  if (status === "in-progress") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  }
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
};

const NGOOpportunities = () => {
  const globalSearch = useAppStore((state) => state.globalSearch);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchMyOpportunities = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await opportunityApi.getMine();
      setOpportunities(data?.opportunities || []);
    } catch (fetchError) {
      setError(
        fetchError?.response?.data?.message || "Unable to load your opportunities.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyOpportunities();
  }, [fetchMyOpportunities]);

  useEffect(() => {
    setPage(1);
  }, [globalSearch, statusFilter]);

  const filteredOpportunities = useMemo(() => {
    const searchValue = globalSearch.trim().toLowerCase();

    return opportunities
      .filter((opportunity) => {
        if (!searchValue) return true;

        const title = opportunity.title?.toLowerCase() || "";
        const location = opportunity.location?.toLowerCase() || "";
        const skills = (opportunity.required_skills || []).join(" ").toLowerCase();
        return (
          title.includes(searchValue) ||
          location.includes(searchValue) ||
          skills.includes(searchValue)
        );
      })
      .filter((opportunity) => {
        if (statusFilter === "all") return true;
        return opportunity.status === statusFilter;
      });
  }, [globalSearch, opportunities, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOpportunities.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedOpportunities = filteredOpportunities.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await opportunityApi.remove(deleteTarget._id);
      toast.success("Opportunity deleted successfully.");
      setOpportunities((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (deleteError) {
      toast.error(deleteError?.response?.data?.message || "Delete failed.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-emerald-950 dark:text-emerald-50">
          <LayoutList size={22} />
          My Opportunities
        </h1>
        <p className="mt-2 text-sm text-emerald-900/70 dark:text-emerald-100/70">
          Manage opportunities created by your NGO account.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {["all", "open", "closed", "in-progress"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              statusFilter === status
                ? "bg-emerald-600 text-white"
                : "border border-emerald-300 bg-white text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/55 dark:text-emerald-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>
      ) : error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </p>
      ) : filteredOpportunities.length === 0 ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          No opportunities found.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {paginatedOpportunities.map((opportunity) => (
              <article
                key={opportunity._id}
                className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                      {opportunity.title}
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                      <MapPin size={14} />
                      {opportunity.location}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                      opportunity.status,
                    )}`}
                  >
                    {opportunity.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(opportunity.required_skills || []).map((skill) => (
                    <span
                      key={`${opportunity._id}-${skill}`}
                      className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-emerald-100 pt-4 dark:border-emerald-900/40">
                  <Link
                    to={`/opportunities/edit/${opportunity._id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-sky-300 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-900/30"
                  >
                    <Pencil size={13} />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(opportunity)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/30"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300"
              >
                Previous
              </button>
              <span className="text-xs text-emerald-700 dark:text-emerald-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-emerald-950">
            <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              Delete Opportunity
            </h2>
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
              Delete "{deleteTarget.title}"? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-emerald-300 px-4 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-700 dark:text-emerald-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGOOpportunities;
