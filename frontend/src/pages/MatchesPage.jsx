import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { matchApi } from "../api/matchApi";
import { opportunityApi } from "../api/opportunityApi";
import { useAppStore } from "../store/useAppStore";

const scoreBadgeClass = (score) => {
  if (score >= 80) return "bg-emerald-100 text-emerald-700";
  if (score >= 60) return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
};

const VolunteerMatches = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const data = await matchApi.getVolunteerMatches();
        setMatches(data?.matches || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Unable to load matches.");
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  if (loading) {
    return <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>;
  }

  return (
    <section className="space-y-4 rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
      <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
        Recommended Opportunities
      </h2>

      {matches.length === 0 ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/25 dark:text-emerald-300">
          No matches found yet. Update your profile skills and location for better recommendations.
        </p>
      ) : (
        <div className="grid gap-4">
          {matches.map((match) => (
            <article
              key={match._id}
              className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                    {match.opportunity?.title}
                  </h3>
                  <p className="mt-1 text-sm text-emerald-800/75 dark:text-emerald-200/75">
                    NGO: {match.ngo?.name || "Unknown NGO"}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                    <MapPin size={14} />
                    {match.opportunity?.location}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${scoreBadgeClass(
                    match.score,
                  )}`}
                >
                  Match Score {match.score}
                </span>
              </div>

              <p className="mt-3 text-sm text-emerald-900/75 dark:text-emerald-100/75">
                {match.opportunity?.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {(match.skill_overlap || []).map((skill) => (
                  <span
                    key={`${match._id}-${skill}`}
                    className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/opportunities/${match.opportunity?._id}`}
                  className="rounded-lg border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                >
                  View Details
                </Link>
                {match.ngo?._id && (
                  <Link
                    to={`/chat/${match.ngo._id}`}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    Message NGO
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

const NgoMatches = () => {
  const currentUser = useAppStore((state) => state.currentUser);
  const [loading, setLoading] = useState(true);
  const [matchedByOpportunity, setMatchedByOpportunity] = useState([]);

  const userId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    const loadMatches = async () => {
      if (!userId) return;
      setLoading(true);

      try {
        const opportunitiesData = await opportunityApi.getAll();
        const opportunities = (opportunitiesData?.opportunities || []).filter(
          (item) => item?.ngo_id?._id === userId,
        );

        const matchResults = await Promise.all(
          opportunities.map(async (opportunity) => {
            try {
              const data = await matchApi.getOpportunityMatches(opportunity._id);
              return data;
            } catch {
              return {
                opportunity: {
                  _id: opportunity._id,
                  title: opportunity.title,
                  location: opportunity.location,
                },
                volunteers: [],
              };
            }
          }),
        );

        setMatchedByOpportunity(matchResults);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Unable to load volunteer matches.");
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [userId]);

  const totalMatches = useMemo(
    () =>
      matchedByOpportunity.reduce(
        (acc, item) => acc + (item?.volunteers?.length || 0),
        0,
      ),
    [matchedByOpportunity],
  );

  if (loading) {
    return <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>;
  }

  return (
    <section className="space-y-4 rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
          Matched Volunteers
        </h2>
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Total Matches: {totalMatches}
        </span>
      </div>

      {matchedByOpportunity.length === 0 ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/25 dark:text-emerald-300">
          No opportunities found for this NGO account.
        </p>
      ) : (
        <div className="grid gap-4">
          {matchedByOpportunity.map((entry) => (
            <article
              key={entry?.opportunity?._id}
              className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/50"
            >
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                  {entry?.opportunity?.title}
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {entry?.opportunity?.location}
                </p>
              </div>

              {entry?.volunteers?.length ? (
                <div className="grid gap-2">
                  {entry.volunteers.map((volunteer) => (
                    <div
                      key={volunteer._id}
                      className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-900/20"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                            {volunteer.name}
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300">
                            {volunteer.location || "Location not set"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scoreBadgeClass(
                              volunteer.score,
                            )}`}
                          >
                            Score {volunteer.score}
                          </span>
                          <Link
                            to={`/chat/${volunteer._id}`}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            Message Volunteer
                          </Link>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {(volunteer.skills || []).map((skill) => (
                          <span
                            key={`${volunteer._id}-${skill}`}
                            className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
                  No matched volunteers yet for this opportunity.
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

const MatchesPage = () => {
  const user = useAppStore((state) => state.currentUser);
  const isVolunteer = user?.role === "volunteer";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <h1 className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">
          {isVolunteer ? "My Matches" : "Opportunity Matches"}
        </h1>
        <p className="mt-2 text-sm text-emerald-900/70 dark:text-emerald-100/70">
          {isVolunteer
            ? "Discover opportunities that best fit your skills and location."
            : "Review volunteers matched to each of your opportunities."}
        </p>
      </section>

      {isVolunteer ? <VolunteerMatches /> : <NgoMatches />}
    </div>
  );
};

export default MatchesPage;
