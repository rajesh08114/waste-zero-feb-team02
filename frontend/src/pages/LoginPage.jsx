import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import AuthLayout from "./Auth/AuthLayout";
import { getDashboardRoute } from "../utils/dashboardRoute";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAppStore((state) => state.login);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const currentUser = useAppStore((state) => state.currentUser);
  const authLoading = useAppStore((state) => state.authLoading);
  const authError = useAppStore((state) => state.authError);
  const clearAuthError = useAppStore((state) => state.clearAuthError);

  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });

  const redirectPath = useMemo(() => getDashboardRoute(currentUser), [currentUser]);
  const infoMessage =
    typeof location.state?.message === "string" ? location.state.message : "";

  if (isAuthenticated) return <Navigate to={redirectPath} replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearAuthError();
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login({
      email: formState.email.trim(),
      password: formState.password,
    });

    if (!result.success) return;

    const requestedPath = location.state?.from;
    if (requestedPath) {
      navigate(requestedPath, { replace: true });
      return;
    }

    navigate(getDashboardRoute(result.user), { replace: true });
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">
          Welcome back!
        </h1>
        <p className="text-gray-500 mb-6 dark:text-gray-300">
          Sign in to your WasteZero account
        </p>

        {infoMessage && (
          <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
            {infoMessage}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formState.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-900 dark:text-white"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Your password"
            value={formState.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-900 dark:text-white"
            required
          />

          {authError && (
            <p className="text-red-500 text-sm">{authError}</p>
          )}

          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg">
            {authLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm dark:text-gray-300">
          Don't have an account?{" "}
          <Link to="/signup" className="text-emerald-600 font-semibold">
            Create Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

