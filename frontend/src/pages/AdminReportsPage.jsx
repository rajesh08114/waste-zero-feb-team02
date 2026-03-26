import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../api/adminApi";

const buildDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const saveBlob = (blob, filename) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(objectUrl);
};

const maxSeriesValue = (items) => {
  const values = items.map((item) => item.count);
  return Math.max(...values, 1);
};

const formatMetricLabel = (value) =>
  value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());

const AdminReportsPage = () => {
  const [range, setRange] = useState(buildDefaultRange);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState("");

  const loadReport = async (nextRange = range) => {
    setLoading(true);

    try {
      const data = await adminApi.getReports(nextRange);
      setReport(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load reports.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialRange = buildDefaultRange();
    const initializeReport = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getReports(initialRange);
        setReport(data);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Unable to load reports.");
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    initializeReport();
  }, []);

  const handleRangeChange = (event) => {
    const { name, value } = event.target;
    setRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    await loadReport(range);
  };

  const handleDownload = async (format) => {
    setDownloading(format);
    try {
      const blob = await adminApi.downloadReport({ ...range, format });
      saveBlob(blob, `wastezero-report.${format}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || `Unable to export ${format}.`);
    } finally {
      setDownloading("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <h1 className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">
          Reports & Analytics
        </h1>
        <p className="mt-2 text-sm text-emerald-900/70 dark:text-emerald-100/70">
          Review growth trends, volunteer participation, and export governance-ready reports.
        </p>
      </section>

      <form
        onSubmit={handleGenerate}
        className="rounded-3xl border border-emerald-200/70 bg-white/90 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <input
            type="date"
            name="startDate"
            value={range.startDate}
            onChange={handleRangeChange}
            className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
          />
          <input
            type="date"
            name="endDate"
            value={range.endDate}
            onChange={handleRangeChange}
            className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
          />
          <button
            type="submit"
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Generate
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleDownload("csv")}
              disabled={downloading !== ""}
              className="rounded-2xl border border-emerald-300 px-4 py-3 text-xs font-semibold text-emerald-700 disabled:opacity-60 dark:border-emerald-700 dark:text-emerald-300"
            >
              {downloading === "csv" ? "Exporting..." : "CSV"}
            </button>
            <button
              type="button"
              onClick={() => handleDownload("pdf")}
              disabled={downloading !== ""}
              className="rounded-2xl border border-emerald-300 px-4 py-3 text-xs font-semibold text-emerald-700 disabled:opacity-60 dark:border-emerald-700 dark:text-emerald-300"
            >
              {downloading === "pdf" ? "Exporting..." : "PDF"}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>
      ) : !report ? (
        <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
          No report data available.
        </p>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(report.summary || {}).map(([key, value]) => (
              <article
                key={key}
                className="rounded-3xl border border-emerald-200/70 bg-white/90 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-300/70">
                  {formatMetricLabel(key)}
                </p>
                <p className="mt-3 text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">
                  {value}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
              <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
                User Growth
              </h2>
              <div className="mt-5 space-y-3">
                {report.userGrowth.map((item) => (
                  <div key={item.date}>
                    <div className="mb-1 flex items-center justify-between text-xs text-emerald-700/80 dark:text-emerald-300/80">
                      <span>{item.date}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{
                          width: `${(item.count / maxSeriesValue(report.userGrowth)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
              <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
                Opportunity Creation Trends
              </h2>
              <div className="mt-5 space-y-3">
                {report.opportunityTrends.map((item) => (
                  <div key={item.date}>
                    <div className="mb-1 flex items-center justify-between text-xs text-emerald-700/80 dark:text-emerald-300/80">
                      <span>{item.date}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <div
                        className="h-2 rounded-full bg-teal-500"
                        style={{
                          width: `${(item.count / maxSeriesValue(report.opportunityTrends)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
            <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
              Volunteer Participation
            </h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-200 dark:border-emerald-900/40">
                    <th className="pb-3 pr-4 font-semibold text-emerald-900 dark:text-emerald-100">
                      Metric
                    </th>
                    <th className="pb-3 font-semibold text-emerald-900 dark:text-emerald-100">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.volunteerParticipation.map((item) => (
                    <tr
                      key={item.label}
                      className="border-b border-emerald-100 dark:border-emerald-900/30"
                    >
                      <td className="py-3 pr-4 text-emerald-800 dark:text-emerald-200">
                        {item.label}
                      </td>
                      <td className="py-3 font-semibold text-emerald-900 dark:text-emerald-100">
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminReportsPage;
