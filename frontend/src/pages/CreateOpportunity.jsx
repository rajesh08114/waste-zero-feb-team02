import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { opportunityApi } from "../api/opportunityApi";

const SKILL_OPTIONS = [
  "Community Outreach",
  "Communication",
  "Coordination",
  "Data Entry",
  "Event Management",
  "Fundraising",
  "Logistics",
  "Social Media",
  "Teaching",
  "Teamwork",
];

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

const initialState = {
  title: "",
  description: "",
  requiredSkills: [],
  duration: "",
  location: "",
  status: "open",
};

const CreateOpportunity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const selectedSkillsPreview = useMemo(
    () => formData.requiredSkills.join(", "),
    [formData.requiredSkills],
  );

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMessage("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.title.trim()) nextErrors.title = "Title is required.";
    if (!formData.description.trim()) {
      nextErrors.description = "Description is required.";
    }
    if (!formData.duration.trim()) nextErrors.duration = "Duration is required.";
    if (!formData.location.trim()) nextErrors.location = "Location is required.";
    if (formData.requiredSkills.length === 0) {
      nextErrors.requiredSkills = "Select at least one required skill.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    updateField(name, value);
  };

  const handleSkillsChange = (event) => {
    const selected = Array.from(event.target.selectedOptions, (item) => item.value);
    updateField("requiredSkills", selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await opportunityApi.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        required_skills: formData.requiredSkills,
        duration: formData.duration.trim(),
        location: formData.location.trim(),
        status: formData.status,
      });

      setSuccessMessage("Opportunity created successfully.");
      toast.success("Opportunity created successfully");
      navigate("/dashboard/ngo", { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to create opportunity.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-linear-to-br from-emerald-50 to-white px-4 py-16 dark:from-emerald-950 dark:to-black">
      <div className="w-full max-w-3xl rounded-3xl border border-emerald-200/60 bg-white p-12 shadow-2xl backdrop-blur-md transition-all duration-300 dark:border-emerald-900/60 dark:bg-emerald-950/70">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-emerald-100">
            Create Opportunity
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-emerald-300">
            Fill in the details so volunteers can discover and join your initiative.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-emerald-200">
              Opportunity Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-emerald-200">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="5"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-emerald-200">
                Duration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="duration"
                placeholder="e.g. 2 weeks"
                value={formData.duration}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
              />
              {errors.duration && (
                <p className="text-xs text-red-500">{errors.duration}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-emerald-200">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
              />
              {errors.location && (
                <p className="text-xs text-red-500">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-emerald-200">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <select
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleSkillsChange}
              multiple
              className="h-40 w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 shadow-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
            >
              {SKILL_OPTIONS.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-emerald-400">
              Hold Ctrl (Windows) or Command (Mac) to select multiple skills.
            </p>
            {selectedSkillsPreview && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Selected: {selectedSkillsPreview}
              </p>
            )}
            {errors.requiredSkills && (
              <p className="text-xs text-red-500">{errors.requiredSkills}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-emerald-200">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {successMessage && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {successMessage}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-emerald-600 to-green-500 py-3.5 font-semibold tracking-wide text-white shadow-lg transition-all duration-300 hover:from-emerald-500 hover:to-green-400 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating Opportunity..." : "Create Opportunity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOpportunity;
