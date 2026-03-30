import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Mail, MapPin, UserRound } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import WasteSkillSelect from "../common/WasteSkillSelect";

const getInitialState = (user) => ({
  name: user?.name ?? "",
  email: user?.email ?? "",
  location: user?.location ?? "",
  bio: user?.bio ?? "",
  skills: user?.skills ?? [],
});

const ProfileDetailsForm = () => {
  const user = useAppStore((state) => state.currentUser);
  const updateCurrentUser = useAppStore((state) => state.updateCurrentUser);
  const userLoading = useAppStore((state) => state.userLoading);

  const [formState, setFormState] = useState(() => getInitialState(user));
  const [saveNotice, setSaveNotice] = useState("");

  const isVolunteer = useMemo(() => user?.role === "volunteer", [user?.role]);

  useEffect(() => {
    setFormState(getInitialState(user));
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSaveNotice("");
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveNotice("");

    const payload = {
      name: formState.name.trim(),
      location: formState.location.trim(),
      bio: formState.bio.trim(),
    };

    if (isVolunteer) {
      payload.skills = formState.skills;
    }

    const result = await updateCurrentUser(payload);
    setSaveNotice(
      result.success ? "Profile updated successfully." : result.message,
    );
  };

  return (
    <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60 sm:p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
          Personal Information
        </h2>
        <p className="mt-1 text-sm text-emerald-900/70 dark:text-emerald-100/70">
          Update your personal information and profile details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-emerald-900/80 dark:text-emerald-100/80">
              <UserRound size={15} />
              Full Name
            </span>
            <input
              name="name"
              value={formState.name}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
            />
          </label>

          <label className="block">
            <span className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-emerald-900/80 dark:text-emerald-100/80">
              <Mail size={15} />
              Email
            </span>
            <input
              value={formState.email}
              readOnly
              className="w-full cursor-not-allowed rounded-2xl border border-emerald-200 bg-emerald-100/70 px-4 py-3 text-sm text-emerald-900/85 dark:border-emerald-800 dark:bg-emerald-900/45 dark:text-emerald-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-emerald-900/80 dark:text-emerald-100/80">
              <MapPin size={15} />
              Location
            </span>
            <input
              name="location"
              value={formState.location}
              onChange={handleChange}
              className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
            />
          </label>

          {isVolunteer && (
            <div className="md:col-span-2">
              <div className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-emerald-900/80 dark:text-emerald-100/80">
                <BriefcaseBusiness size={15} />
                Skills
              </div>
              <WasteSkillSelect
                label=""
                value={formState.skills}
                onChange={(skills) => {
                  setSaveNotice("");
                  setFormState((prev) => ({ ...prev, skills }));
                }}
                helperText="Keep your volunteer skills focused on waste management, recycling, and environmental service work."
              />
            </div>
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-emerald-900/80 dark:text-emerald-100/80">
            Bio
          </span>
          <textarea
            name="bio"
            rows={4}
            value={formState.bio}
            onChange={handleChange}
            className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
          />
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={userLoading}
            className="rounded-full bg-emerald-600 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {userLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {saveNotice && (
        <p className="mt-4 rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/45 dark:text-emerald-200">
          {saveNotice}
        </p>
      )}
    </section>
  );
};

export default ProfileDetailsForm;
