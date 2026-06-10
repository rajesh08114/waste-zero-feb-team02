import { useDeferredValue, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../api/adminApi";

const roleOptions = ["all", "admin", "NGO", "volunteer"];
const statusOptions = ["all", "active", "suspended"];

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, count: 0 });

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);

      try {
        const data = await adminApi.getUsers({
          page,
          pageSize: 10,
          search: deferredSearch.trim() || undefined,
          role: role === "all" ? undefined : role,
          status: status === "all" ? undefined : status,
        });

        setUsers(data?.users || []);
        setPagination({
          page: data?.page || 1,
          totalPages: data?.totalPages || 1,
          count: data?.count || 0,
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Unable to load users.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [deferredSearch, page, role, status]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, role, status]);

  const handleStatusChange = async (userId, nextStatus) => {
    setUpdatingId(userId);

    try {
      const data = await adminApi.updateUserStatus(userId, nextStatus);
      const updatedUser = data?.user;

      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? updatedUser : user)),
      );
      setSelectedUser((prev) => (prev?._id === userId ? updatedUser : prev));
      toast.success(data?.message || "User status updated.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update user status.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <h1 className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">
          User Management
        </h1>
        <p className="mt-2 text-sm text-emerald-900/70 dark:text-emerald-100/70">
          Search the platform roster, review profiles, and suspend or reactivate accounts.
        </p>
      </section>

      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_0.8fr_0.8fr]">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or location"
            className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
          />

          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All roles" : option}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-950 outline-none dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-50"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All statuses" : option}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
            All Users
          </h2>
          <span className="text-xs font-semibold text-emerald-700/75 dark:text-emerald-300/75">
            {pagination.count} records
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
            No users matched the current filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-200 text-emerald-900 dark:border-emerald-900/40 dark:text-emerald-100">
                  <th className="pb-3 pr-4 font-semibold">Name</th>
                  <th className="pb-3 pr-4 font-semibold">Role</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 pr-4 font-semibold">Location</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-emerald-100 dark:border-emerald-900/30">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                        {user.name}
                      </p>
                      <p className="text-xs text-emerald-700/75 dark:text-emerald-300/75">
                        {user.email}
                      </p>
                    </td>
                    <td className="py-4 pr-4 text-emerald-800 dark:text-emerald-200">
                      {user.role}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/45 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/35 dark:text-rose-300"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-emerald-800/80 dark:text-emerald-200/80">
                      {user.location || "Not set"}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/35"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === user._id}
                          onClick={() =>
                            handleStatusChange(
                              user._id,
                              user.status === "active" ? "suspended" : "active",
                            )
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 ${
                            user.status === "active"
                              ? "bg-rose-600 hover:bg-rose-500"
                              : "bg-emerald-600 hover:bg-emerald-500"
                          }`}
                        >
                          {updatingId === user._id
                            ? "Updating..."
                            : user.status === "active"
                              ? "Suspend"
                              : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300"
          >
            Previous
          </button>
          <span className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPage((prev) => Math.min(pagination.totalPages, prev + 1))
            }
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300"
          >
            Next
          </button>
        </div>
      </section>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl dark:bg-emerald-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
                  {selectedUser.name}
                </h2>
                <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                  {selectedUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-full border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-700 dark:text-emerald-300"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-300/70">
                  Role
                </p>
                <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
                  {selectedUser.role}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-300/70">
                  Status
                </p>
                <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
                  {selectedUser.status}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-300/70">
                  Location
                </p>
                <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
                  {selectedUser.location || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-300/70">
                  Created
                </p>
                <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-300/70">
                Bio
              </p>
              <p className="mt-1 text-sm text-emerald-900/85 dark:text-emerald-100/85">
                {selectedUser.bio || "No bio provided."}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-300/70">
                Skills
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedUser.skills?.length ? (
                  selectedUser.skills.map((skill) => (
                    <span
                      key={`${selectedUser._id}-${skill}`}
                      className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/45 dark:text-emerald-300"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
                    No skills listed.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
