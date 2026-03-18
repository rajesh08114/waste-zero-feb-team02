import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Mail, MapPin, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { opportunityApi } from "../api/opportunityApi";
import { matchApi } from "../api/matchApi";
import { useAppStore } from "../store/useAppStore";

const VolunteerDashboard = () => {
  const user = useAppStore((state) => state.currentUser);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [matchedOpportunities, setMatchedOpportunities] = useState([]);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      setMatchLoading(true);
      try {
        const data = await matchApi.getVolunteerMatches();
        setMatchedOpportunities(data?.matches || []);
      } catch {
        setMatchedOpportunities([]);
      } finally {
        setMatchLoading(false);
      }
    };

    fetchMatches();
  }, []);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const data = await opportunityApi.getAll();
        setOpportunities(data?.opportunities || []);
      } catch (error) {
        setFetchError(
          error?.response?.data?.message || "Unable to load opportunities.",
        );
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const previewOpportunities = useMemo(
    () => opportunities.slice(0, 2),
    [opportunities],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <h1 className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">
          Volunteer Dashboard
        </h1>
        <p className="mt-2 text-emerald-900/70 dark:text-emerald-100/70">
          Welcome back, {user?.name ?? "Volunteer"}.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="space-y-4 rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
            Profile Overview
          </h2>

          <div className="space-y-2 text-sm text-emerald-900/75 dark:text-emerald-100/75">
            <p className="flex items-center gap-2">
              <Mail size={15} /> {user?.email}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={15} /> {user?.location || "Location not added"}
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {user?.skills?.length ? (
                user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/45 dark:text-emerald-200"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-900/60 dark:text-emerald-100/60">
                  No skills added yet.
                </span>
              )}
            </div>
          </div>

          <Link
            to="/profile"
            className="inline-flex rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
          >
            Edit My Profile
          </Link>

          {!user?.emailVerified && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              <p className="flex items-start gap-2">
                <ShieldAlert size={14} className="mt-0.5" />
                Please verify your email to unlock all volunteer features.
              </p>
            </div>
          )}
        </section>

        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
                Recommended Opportunities
              </h2>
              <Link
                to="/matches"
                className="text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-300"
              >
                View all matches
              </Link>
            </div>

            {matchLoading ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Loading recommendations...
              </p>
            ) : matchedOpportunities.length === 0 ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                No matches yet. Add skills and location in your profile to improve recommendations.
              </p>
            ) : (
              <div className="grid gap-3">
                {matchedOpportunities.slice(0, 3).map((match) => (
                  <article
                    key={match._id}
                    className="rounded-2xl border border-emerald-200 bg-white p-4 dark:border-emerald-900/40 dark:bg-emerald-950/55"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                          {match.opportunity?.title}
                        </h3>
                        <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                          NGO: {match.ngo?.name || "Unknown NGO"}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-300">
                        Score {match.score}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                      <MapPin size={13} />
                      {match.opportunity?.location}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(match.skill_overlap || []).map((skill) => (
                        <span
                          key={`${match._id}-${skill}`}
                          className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-900/45 dark:text-emerald-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    {match.opportunity?._id && (
                      <Link
                        to={`/opportunities/${match.opportunity._id}`}
                        className="mt-3 inline-flex rounded-lg border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                      >
                        View Opportunity
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
                Opportunities Overview
              </h2>

              <Link
                to="/opportunities"
                className="text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-300"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">
                Loading...
              </p>
            ) : fetchError ? (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
                {fetchError}
              </p>
            ) : (
              <div className="mt-5 grid gap-4">
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  Total Opportunities:{" "}
                  <span className="font-semibold">{opportunities.length}</span>
                </p>

                {previewOpportunities.map((opportunity) => (
                  <div
                    key={opportunity._id}
                    className="group rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-emerald-900/50 dark:bg-emerald-950/60"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
                          {opportunity.title}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-xs text-emerald-800/70 dark:text-emerald-200/70">
                          {opportunity.description}
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
                        {opportunity.status || "open"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                      <MapPin size={13} />
                      {opportunity.location}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-emerald-950 dark:text-emerald-50">
              <ClipboardList size={18} />
              My Applications
            </h2>
            <p className="text-sm text-emerald-900/70 dark:text-emerald-100/70">
              You have not applied to any opportunity yet.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
