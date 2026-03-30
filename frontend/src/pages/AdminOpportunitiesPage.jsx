import { useDeferredValue, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../api/adminApi";

const statusOptions = ["all", "open", "closed", "in-progress"];

const AdminOpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [ngo, setNgo] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, count: 0 });

  const deferredSearch = useDeferredValue(search);
  const deferredNgo = useDeferredValue(ngo);
  const deferredLocation = useDeferredValue(location);

  useEffect(() => {
    const loadOpportunities = async () => {
      setLoading(true);

      try {
        const data = await adminApi.getOpportunities({
          page,
          pageSize: 10,
          search: deferredSearch.trim() || undefined,
          status: status === "all" ? undefined : status,
          ngo: deferredNgo.trim() || undefined,
          location: deferredLocation.trim() || undefined,
        });

        setOpportunities(data?.opportunities || []);
        setPagination({
          page: data?.page || 1,
          totalPages: data?.totalPages || 1,
          count: data?.count || 0,
        });
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Unable to load moderated opportunities.",
        );
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, [deferredLocation, deferredNgo, deferredSearch, page, status]);

  useEffect(() => {
    setPage(1);
  }, [deferredLocation, deferredNgo, deferredSearch, status]);

  const handleDelete = async (opportunityId) => {
    const confirmed = window.confirm(
      "Remove this opportunity from the platform?",
    );
    if (!confirmed) return;

    setDeletingId(opportunityId);
    try {
      const data = await adminApi.deleteOpportunity(opportunityId);
      setOpportunities((prev) =>
        prev.filter((opportunity) => opportunity._id !== opportunityId),
      );
      setSelectedOpportunity((prev) =>
        prev?._id === opportunityId ? null : prev,
      );
      toast.success(data?.message || "Opportunity removed.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete opportunity.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <h1 className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">
          Opportunity Moderation
        </h1>
        <p className="mt-2 text-sm text-emerald-900/70 dark:text-emerald-100/70">
          Review published opportunities, inspect details, and remove inappropriate listings.
        </p>
      </section>

      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <div className="grid gap-3 lg:grid-cols-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, NGO, location"
            className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All statuses" : option}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={ngo}
            onChange={(event) => setNgo(event.target.value)}
            placeholder="Filter by NGO"
            className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
          />
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Filter by location"
            className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
            Published Opportunities
          </h2>
          <span className="text-xs font-semibold text-emerald-700/75 dark:text-emerald-300/75">
            {pagination.count} records
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>
        ) : opportunities.length === 0 ? (
          <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
            No opportunities matched the current filters.
          </p>
        ) : (
          <div className="grid gap-4">
            {opportunities.map((opportunity) => (
              <article
                key={opportunity._id}
                className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                      {opportunity.title}
                    </h3>
                    <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                      NGO: {opportunity.ngo_id?.name || "Unknown NGO"}
                    </p>
                    <p className="mt-1 text-xs text-emerald-700/75 dark:text-emerald-300/75">
                      {opportunity.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                      {opportunity.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedOpportunity(opportunity)}
                      className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-white dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === opportunity._id}
                      onClick={() => handleDelete(opportunity._id)}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                    >
                      {deletingId === opportunity._id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
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

      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl dark:bg-emerald-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
                  {selectedOpportunity.title}
                </h2>
                <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                  {selectedOpportunity.ngo_id?.name || "Unknown NGO"} - {selectedOpportunity.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOpportunity(null)}
                className="rounded-full border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-700 dark:text-emerald-300"
              >
                Close
              </button>
            </div>

            <p className="mt-5 text-sm leading-7 text-emerald-900/85 dark:text-emerald-100/85">
              {selectedOpportunity.description}
            </p>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-300/70">
                Required skills
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(selectedOpportunity.required_skills || []).map((skill) => (
                  <span
                    key={`${selectedOpportunity._id}-${skill}`}
                    className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/45 dark:text-emerald-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOpportunitiesPage;
