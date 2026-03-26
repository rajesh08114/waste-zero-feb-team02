import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { authApi } from "../api/authApi";
import { useAppStore } from "../store/useAppStore";
import { getApiErrorMessage } from "../utils/apiError";
import { getDashboardRoute } from "../utils/dashboardRoute";

const VerifyEmail = () => {
  const location = useLocation();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const currentUser = useAppStore((state) => state.currentUser);
  const loadCurrentUser = useAppStore((state) => state.loadCurrentUser);

  const token = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return query.get("token");
  }, [location.search]);

  const dashboardPath = useMemo(() => getDashboardRoute(currentUser), [currentUser]);

  const [status, setStatus] = useState(token ? "verifying" : "error");
  const [message, setMessage] = useState(
    token ? "" : "No verification token found.",
  );

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const data = await authApi.verifyEmail(token);
        setStatus("success");
        setMessage(data?.message ?? "Your email has been verified successfully.");
        if (isAuthenticated) {
          await loadCurrentUser();
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          getApiErrorMessage(
            error,
            "Verification failed. The link may be expired or invalid.",
          ),
        );
      }
    };

    verifyEmail();
  }, [isAuthenticated, loadCurrentUser, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 p-4 dark:from-emerald-950 dark:via-slate-950 dark:to-emerald-900">
      <div className="w-full max-w-md rounded-3xl border border-emerald-200/70 bg-white/90 p-8 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <div className="flex flex-col items-center text-center">
          {status === "verifying" && (
            <>
              <div className="mb-4 text-emerald-600">
                <Loader2 size={64} className="animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-emerald-950 dark:text-emerald-100">
                Verifying your email
              </h1>
              <p className="mt-2 text-emerald-900/70 dark:text-emerald-100/70">
                Please wait while we confirm your account.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-4 text-emerald-500">
                <CheckCircle size={64} />
              </div>
              <h1 className="text-2xl font-bold text-emerald-950 dark:text-emerald-100">
                Email Verified!
              </h1>
              <p className="mt-2 text-emerald-900/70 dark:text-emerald-100/70">
                {message}
              </p>
              <Link
                to={isAuthenticated ? dashboardPath : "/login"}
                className="mt-8 w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                {isAuthenticated ? "Back to Dashboard" : "Continue to Login"}
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-4 text-rose-500">
                <XCircle size={64} />
              </div>
              <h1 className="text-2xl font-bold text-emerald-950 dark:text-emerald-100">
                Verification Failed
              </h1>
              <p className="mt-2 text-emerald-900/70 dark:text-emerald-100/70">
                {message}
              </p>
              <Link
                to={isAuthenticated ? dashboardPath : "/login"}
                className="mt-8 w-full rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
