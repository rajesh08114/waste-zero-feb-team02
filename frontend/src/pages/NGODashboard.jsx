import { useEffect, useMemo, useState } from "react";
import { Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { opportunityApi } from "../api/opportunityApi";
import { useAppStore } from "../store/useAppStore";

const statusBadgeClass = (status) => {
  if (status === "closed") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
  }
  if (status === "in-progress") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  }
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-300";
};

const NGODashboard = () => {
  const user = useAppStore((state) => state.currentUser);
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchMyOpportunities = async () => {
      setLoading(true);
      try {
        const data = await opportunityApi.getMine();
        setMyOpportunities(data?.opportunities || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Unable to load opportunities.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyOpportunities();
  }, []);

  const previewOpportunities = useMemo(
    () => myOpportunities.slice(0, 3),
    [myOpportunities],
  );

  const handleDeleteOpportunity = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await opportunityApi.remove(deleteTarget._id);
      toast.success("Opportunity deleted successfully.");
      setMyOpportunities((prev) =>
        prev.filter((opportunity) => opportunity._id !== deleteTarget._id),
      );
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 dark:from-emerald-950 dark:via-slate-950 dark:to-emerald-900">
      <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/60">
        <h1 className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">
          NGO Dashboard
        </h1>
        <p className="mt-2 text-emerald-700 dark:text-emerald-300">
          Managing opportunities for {user?.name ?? "your organization"}.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="space-y-4 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/60">
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
            Organization Profile
          </h2>

          <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-emerald-300">
            <Mail size={15} /> {user?.email}
          </p>

          <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-emerald-300">
            <MapPin size={15} /> {user?.location || "Location not added"}
          </p>

          <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
            {user?.bio ||
              "Add a short bio for volunteers to understand your mission."}
          </p>

          <Link
            to="/profile"
            className="inline-flex rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
          >
            Edit Organization Profile
          </Link>
        </section>

        <div className="space-y-6 xl:col-span-2">
          <Link
            to="/opportunities/create"
            className="block rounded-3xl border border-dashed border-emerald-300 bg-white p-6 text-center shadow-sm transition hover:shadow-md dark:border-emerald-800 dark:bg-emerald-950/60"
          >
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
              Create Opportunity
            </h2>
            <p className="mt-2 text-emerald-700 dark:text-emerald-300">
              Publish new opportunities and invite volunteers.
            </p>
          </Link>

          <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-md dark:border-emerald-900/50 dark:bg-emerald-950/60">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                My Opportunities
              </h2>
              <Link
                to="/dashboard/ngo/opportunities"
                className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Loading...
              </p>
            ) : previewOpportunities.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-emerald-300">
                No opportunities yet.
              </p>
            ) : (
              <div className="space-y-4">
                {previewOpportunities.map((opportunity) => (
                  <div
                    key={opportunity._id}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4 dark:border-emerald-900/40 dark:bg-emerald-900/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-emerald-100">
                          {opportunity.title}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-emerald-400">
                          <MapPin size={13} />
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
                      {(opportunity.required_skills || []).slice(0, 4).map((skill) => (
                        <span
                          key={`${opportunity._id}-${skill}`}
                          className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <Link
                        to={`/opportunities/edit/${opportunity._id}`}
                        className="rounded-lg border border-sky-300 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-900/30"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(opportunity)}
                        className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

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
                onClick={handleDeleteOpportunity}
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

export default NGODashboard;
