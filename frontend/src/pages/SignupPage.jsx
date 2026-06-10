import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import AuthLayout from "./Auth/AuthLayout";
import { getDashboardRoute } from "../utils/dashboardRoute";
import WasteSkillSelect from "../components/common/WasteSkillSelect";

const initialFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "volunteer",
  location: "",
  bio: "",
  skills: [],
};

const SignupPage = () => {
  const navigate = useNavigate();
  const signup = useAppStore((state) => state.signup);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const authLoading = useAppStore((state) => state.authLoading);
  const authError = useAppStore((state) => state.authError);
  const clearAuthError = useAppStore((state) => state.clearAuthError);

  const [formState, setFormState] = useState(initialFormState);
  const [localError, setLocalError] = useState("");

  const currentUser = useAppStore((state) => state.currentUser);

  if (isAuthenticated) return <Navigate to={getDashboardRoute(currentUser)} replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearAuthError();
    setLocalError("");
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" && value !== "volunteer" ? { skills: [] } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formState.password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    const payload = {
      name: formState.name,
      email: formState.email,
      password: formState.password,
      role: formState.role,
      location: formState.location,
      bio: formState.bio,
      skills: formState.skills,
    };

    const result = await signup(payload);
    if (!result.success) return;

    navigate("/login", {
      replace: true,
      state: {
        message: "Account created successfully. Please sign in to continue.",
      },
    });
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          Create a new account
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            value={formState.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-900 dark:text-white"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formState.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-900 dark:text-white"
          />

          <input
            name="location"
            placeholder="Location"
            value={formState.location}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-900 dark:text-white"
          />

          <select
            name="role"
            value={formState.role}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-900 dark:text-white"
          >
            <option value="volunteer">Volunteer</option>
            <option value="NGO">NGO</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formState.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-900 dark:text-white"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formState.confirmPassword}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-900 dark:text-white"
          />

          {formState.role === "volunteer" && (
            <WasteSkillSelect
              label="Waste Management Skills"
              value={formState.skills}
              onChange={(skills) =>
                setFormState((prev) => ({ ...prev, skills }))
              }
              helperText="Choose the recycling, collection, or cleanup skills that best match your experience."
            />
          )}

          <textarea
            name="bio"
            placeholder="Bio"
            value={formState.bio}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 dark:bg-slate-900 dark:text-white"
          />

          {(localError || authError) && (
            <p className="text-red-500 text-sm">{localError || authError}</p>
          )}

          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg">
            {authLoading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm dark:text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
