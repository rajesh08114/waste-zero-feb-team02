import { useEffect, useState } from "react";
import { Activity, BriefcaseBusiness, Building2, Users } from "lucide-react";
import { adminApi } from "../api/adminApi";

const summaryCards = [
  { key: "totalUsers", label: "Total users", icon: Users },
  { key: "activeNgos", label: "Active NGOs", icon: Building2 },
  { key: "activeVolunteers", label: "Active volunteers", icon: Activity },
  { key: "totalOpportunities", label: "Total opportunities", icon: BriefcaseBusiness },
];

const formatTimestamp = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState({
    counts: {},
    recentActivity: [],
  });

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await adminApi.getOverview();
        setOverview({
          counts: data?.counts || {},
          recentActivity: data?.recentActivity || [],
        });
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message || "Unable to load admin overview.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <h1 className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-emerald-900/70 dark:text-emerald-100/70">
          Platform health, moderation signals, and recent activity at a glance.
        </p>
      </section>

      {loading ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>
      ) : error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </p>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.key}
                  className="rounded-3xl border border-emerald-200/70 bg-white/90 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-emerald-900/70 dark:text-emerald-100/70">
                        {card.label}
                      </p>
                      <p className="mt-3 text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">
                        {overview.counts?.[card.key] ?? 0}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/45 dark:text-emerald-300">
                      <Icon size={20} />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
                Recent Activity
              </h2>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/70 dark:text-emerald-300/70">
                Live governance feed
              </span>
            </div>

            {overview.recentActivity.length === 0 ? (
              <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
                No recent activity found.
              </p>
            ) : (
              <div className="space-y-3">
                {overview.recentActivity.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/20"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
