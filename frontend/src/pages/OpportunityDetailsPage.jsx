import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin } from "lucide-react";
import { opportunityApi } from "../api/opportunityApi";
import { useAppStore } from "../store/useAppStore";

const statusBadgeClass = (status) => {
  if (status === "closed") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
  }
  if (status === "in-progress") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  }
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
};

const OpportunityDetailsPage = () => {
  const { id } = useParams();
  const currentUser = useAppStore((state) => state.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [opportunity, setOpportunity] = useState(null);

  useEffect(() => {
    const loadOpportunity = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await opportunityApi.getById(id);
        setOpportunity(data);
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message || "Unable to load opportunity details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOpportunity();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>;
  }

  if (error || !opportunity) {
    return (
      <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-300">
        {error || "Opportunity not found."}
      </p>
    );
  }

  const ngoId = opportunity?.ngo_id?._id || opportunity?.ngo_id;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">
              {opportunity.title}
            </h1>
            <p className="mt-1 text-sm text-emerald-900/70 dark:text-emerald-100/70">
              NGO: {opportunity?.ngo_id?.name || "Unknown NGO"}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
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

        <p className="mt-4 text-sm text-emerald-900/80 dark:text-emerald-100/80">
          {opportunity.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(opportunity.required_skills || []).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/opportunities"
            className="rounded-lg border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
          >
            Back to Opportunities
          </Link>
          {currentUser?.role === "volunteer" && ngoId && (
            <Link
              to={`/chat/${ngoId}`}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Message NGO
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default OpportunityDetailsPage;
