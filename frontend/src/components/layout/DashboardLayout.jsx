import { Bell, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { getDashboardRoute } from "../../utils/dashboardRoute";
import DashboardSidebar from "./DashboardSidebar";

const formatNotificationTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppStore((state) => state.currentUser);
  const logout = useAppStore((state) => state.logout);
  const globalSearch = useAppStore((state) => state.globalSearch);
  const setGlobalSearch = useAppStore((state) => state.setGlobalSearch);
  const notifications = useAppStore((state) => state.notifications);
  const unreadNotifications = useAppStore((state) => state.unreadNotifications);
  const fetchNotifications = useAppStore((state) => state.fetchNotifications);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useAppStore(
    (state) => state.markAllNotificationsRead,
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const dashboardPath = getDashboardRoute(user);

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  useEffect(() => {
    setGlobalSearch("");
  }, [location.pathname, setGlobalSearch]);

  const handleLogout = () => {
    logout();
    setMobileSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  const handleSidebarSelection = () => {
    setMobileSidebarOpen(false);
  };

  const handleToggleNotifications = async () => {
    const nextOpen = !notificationPanelOpen;
    setNotificationPanelOpen(nextOpen);
    if (nextOpen) {
      await fetchNotifications({ limit: 20 });
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    await markAllNotificationsRead();
    setMarkingAllRead(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-slate-950 dark:to-emerald-900">
      <div className="mx-auto flex min-h-screen max-w-425">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="sticky top-0 h-screen p-4">
            <DashboardSidebar
              user={user}
              dashboardPath={dashboardPath}
              onLogout={handleLogout}
              onSelect={handleSidebarSelection}
            />
          </div>
        </aside>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute inset-0 bg-slate-900/50"
              aria-label="Close sidebar backdrop"
            />
            <div className="relative h-full w-[86%] max-w-[320px] p-3">
              <DashboardSidebar
                user={user}
                dashboardPath={dashboardPath}
                onLogout={handleLogout}
                onSelect={handleSidebarSelection}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-emerald-200/70 bg-emerald-100/75 backdrop-blur dark:border-emerald-900/45 dark:bg-emerald-950/55">
            <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen((prev) => !prev)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-white/80 text-emerald-700 md:hidden dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200"
                aria-label="Toggle sidebar"
              >
                {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <div className="relative flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/70 dark:text-emerald-300/70"
                />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search your workspace..."
                  className="w-full rounded-full border border-emerald-200 bg-white/80 py-2.5 pl-10 pr-10 text-sm text-emerald-900 outline-none transition focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/75 dark:text-emerald-100"
                />

                {globalSearch && (
                  <button
                    onClick={() => setGlobalSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-red-500 transition"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                aria-label="Notifications"
                onClick={handleToggleNotifications}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-white/80 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200"
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {notificationPanelOpen && (
              <div className="border-t border-emerald-200/70 bg-white/95 px-4 py-3 sm:px-6 lg:px-8 dark:border-emerald-900/45 dark:bg-emerald-950/75">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    Notifications
                  </h3>
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={markingAllRead || unreadNotifications === 0}
                    className="text-xs font-semibold text-emerald-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-300"
                  >
                    {markingAllRead ? "Updating..." : "Mark all read"}
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-emerald-700/75 dark:text-emerald-300/75">
                    No notifications yet.
                  </p>
                ) : (
                  <div className="grid max-h-56 gap-2 overflow-y-auto">
                    {notifications.map((notification) => (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() => {
                          if (!notification.is_read) {
                            markNotificationRead(notification._id);
                          }
                        }}
                        className={`rounded-xl border px-3 py-2 text-left ${
                          notification.is_read
                            ? "border-emerald-200 bg-white dark:border-emerald-900/40 dark:bg-emerald-950/40"
                            : "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30"
                        }`}
                      >
                        <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs text-emerald-700/85 dark:text-emerald-300/85">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[11px] text-emerald-700/65 dark:text-emerald-300/65">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
