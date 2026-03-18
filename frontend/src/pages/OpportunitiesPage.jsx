import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { opportunityApi } from "../api/opportunityApi";
import { useAppStore } from "../store/useAppStore";

const statusBadgeClass = (status) => {
  if (status === "closed") {
    return "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300";
  }
  if (status === "in-progress") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  }
  return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300";
};

const OpportunitiesPage = () => {
  const globalSearch = useAppStore((state) => state.globalSearch);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await opportunityApi.getAll();
        setOpportunities(data?.opportunities || []);
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message || "Unable to load opportunities.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const searchValue = globalSearch.trim().toLowerCase();

  const filteredOpportunities = useMemo(() => {
    if (!searchValue) return opportunities;

    return opportunities.filter((opportunity) => {
      const title = opportunity.title?.toLowerCase() || "";
      const location = opportunity.location?.toLowerCase() || "";
      const ngoName = opportunity.ngo_id?.name?.toLowerCase() || "";
      const skills = (opportunity.required_skills || []).join(" ").toLowerCase();

      return (
        title.includes(searchValue) ||
        location.includes(searchValue) ||
        ngoName.includes(searchValue) ||
        skills.includes(searchValue)
      );
    });
  }, [opportunities, searchValue]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <h1 className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">
          Opportunities
        </h1>
        <p className="mt-2 text-sm text-emerald-900/70 dark:text-emerald-100/70">
          Browse active opportunities from partner NGOs.
        </p>
      </section>

      {loading ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>
      ) : error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </p>
      ) : filteredOpportunities.length === 0 ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/25 dark:text-emerald-300">
          No opportunities available right now.
        </p>
      ) : (
        <div className="grid gap-5">
          {filteredOpportunities.map((opportunity) => (
            <article
              key={opportunity._id}
              className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-emerald-900/50 dark:bg-emerald-950/60"
            >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                  <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                    {opportunity.title}
                  </h2>
                  <p className="mt-1 text-sm text-emerald-800/75 dark:text-emerald-200/75">
                    NGO: {opportunity.ngo_id?.name || "Unknown NGO"}
                  </p>
                  <p className="mt-2 text-sm text-emerald-800/75 dark:text-emerald-200/75">
                    {opportunity.description}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                    <MapPin size={14} />
                    {opportunity.location}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(opportunity.required_skills || []).map((skill) => (
                      <span
                        key={`${opportunity._id}-${skill}`}
                        className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                        opportunity.status,
                      )}`}
                    >
                      {opportunity.status}
                    </span>
                    <Link
                      to={`/opportunities/${opportunity._id}`}
                      className="rounded-lg border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
