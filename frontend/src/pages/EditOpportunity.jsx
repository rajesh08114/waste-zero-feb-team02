import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { opportunityApi } from "../api/opportunityApi";
import { useAppStore } from "../store/useAppStore";

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
  { value: "in-progress", label: "In Progress" },
];

const EditOpportunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: [],
    duration: "",
    location: "",
    status: "open",
  });
  const [opportunityOwnerId, setOpportunityOwnerId] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [updateNotice, setUpdateNotice] = useState("");

  const userId = currentUser?._id || currentUser?.id || "";
  const isOwner = Boolean(opportunityOwnerId && userId && opportunityOwnerId === userId);

  const selectedSkillsPreview = useMemo(
    () => formData.requiredSkills.join(", "),
    [formData.requiredSkills],
  );

  useEffect(() => {
    const fetchOpportunity = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const data = await opportunityApi.getById(id);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          requiredSkills: data.required_skills || [],
          duration: data.duration || "",
          location: data.location || "",
          status: data.status || "open",
        });
        setOpportunityOwnerId(data?.ngo_id?._id || data?.ngo_id || "");
      } catch (error) {
        const message =
          error?.response?.data?.message || "Unable to load opportunity details.";
        setFetchError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

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

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setUpdateNotice("");
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
    if (!isOwner) return;
    if (!validateForm()) return;

    setUpdating(true);
    try {
      await opportunityApi.update(id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        required_skills: formData.requiredSkills,
        duration: formData.duration.trim(),
        location: formData.location.trim(),
        status: formData.status,
      });

      const notice = "Opportunity updated successfully.";
      setUpdateNotice(notice);
      toast.success(notice);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;

    setDeleteLoading(true);
    try {
      await opportunityApi.remove(id);
      toast.success("Opportunity deleted successfully.");
      navigate("/dashboard/ngo/opportunities", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-emerald-700 dark:text-emerald-300">
        Loading opportunity...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900/40 dark:bg-rose-900/20">
        <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
          {fetchError}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 dark:border-rose-700 dark:text-rose-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800/40 dark:bg-amber-900/20">
        <h1 className="text-lg font-bold text-amber-800 dark:text-amber-200">
          Access restricted
        </h1>
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
          You can only edit opportunities created by your NGO account.
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/ngo/opportunities")}
          className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to My Opportunities
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-linear-to-br from-emerald-50 via-white to-emerald-100 px-4 py-12 dark:from-emerald-950 dark:via-slate-950 dark:to-emerald-900">
      <div className="w-full max-w-3xl rounded-3xl border border-emerald-200/60 bg-white p-10 shadow-2xl backdrop-blur-md dark:border-emerald-900/60 dark:bg-emerald-950/70">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-emerald-100">
            Edit Opportunity
          </h1>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-300">
            {formData.status}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-emerald-200">
              Title
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-emerald-200">
              Description
            </label>
            <textarea
              rows="5"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-emerald-200">
              Required Skills
            </label>
            <select
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleSkillsChange}
              multiple
              className="h-40 w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
            >
              {SKILL_OPTIONS.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
            {selectedSkillsPreview && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Selected: {selectedSkillsPreview}
              </p>
            )}
            {errors.requiredSkills && (
              <p className="text-xs text-red-500">{errors.requiredSkills}</p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-emerald-200">
                Duration
              </label>
              <input
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
              />
              {errors.duration && (
                <p className="text-xs text-red-500">{errors.duration}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-emerald-200">
                Location
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
              />
              {errors.location && (
                <p className="text-xs text-red-500">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-emerald-200">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {updateNotice && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {updateNotice}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-emerald-900/40">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
            >
              Cancel
            </button>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={updating}
                className="rounded-xl bg-linear-to-r from-emerald-600 to-green-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-emerald-500/30 disabled:opacity-60"
              >
                {updating ? "Updating..." : "Update"}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="rounded-xl border border-rose-500 px-6 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-500 hover:text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </form>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-emerald-950">
            <h2 className="text-lg font-bold text-gray-900 dark:text-emerald-100">
              Delete Opportunity
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-emerald-300">
              This action cannot be undone. Are you sure you want to delete this
              opportunity?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-emerald-700 dark:text-emerald-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditOpportunity;
