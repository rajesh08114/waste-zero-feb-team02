import {
  CircleHelp,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Recycle,
  Settings,
  Shield,
  UserRound,
  CalendarDays,
  BriefcaseBusiness,
  PlusCircle,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import ThemeControl from "../theme/ThemeControl";

const createPrimaryItems = (dashboardPath, role) => {
  if (role === "NGO") {
    return [
      { label: "Dashboard", icon: LayoutDashboard, to: dashboardPath },
      {
        label: "My Opportunities",
        icon: CalendarDays,
        to: "/dashboard/ngo/opportunities",
      },
      {
        label: "Browse Opportunities",
        icon: BriefcaseBusiness,
        to: "/opportunities",
      },
      {
        label: "Create Opportunity",
        icon: PlusCircle,
        to: "/opportunities/create",
      },
      {
        label: "Matches",
        icon: MessageCircle,
        to: "/matches",
      },
      {
        label: "Messages",
        icon: MessageCircle,
        to: "/messages",
      },
    ];
  }

  if (role === "volunteer") {
    return [
      { label: "Dashboard", icon: LayoutDashboard, to: dashboardPath },
      {
        label: "Opportunities",
        icon: BriefcaseBusiness,
        to: "/opportunities",
      },
      { label: "Matches", icon: CalendarDays, to: "/matches" },
      { label: "Messages", icon: MessageCircle, to: "/messages" },
    ];
  }

  return [];
};

const settingsItems = [
  { label: "My Profile", icon: UserRound, to: "/profile" },
  { label: "Settings", icon: Settings },
  { label: "Help & Support", icon: CircleHelp },
  { label: "Admin Panel", icon: Shield },
];

const SidebarItem = ({ item, onSelect, dashboardPath }) => {
  const Icon = item.icon;

  if (!item.to) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-emerald-900/55 dark:text-emerald-100/45"
      >
        <Icon size={17} />
        {item.label}
      </button>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === dashboardPath}
      onClick={onSelect}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-emerald-500 text-white shadow"
            : "text-emerald-900 hover:bg-emerald-100/90 dark:text-emerald-100 dark:hover:bg-emerald-900/55"
        }`
      }
    >
      <Icon size={17} />
      {item.label}
    </NavLink>
  );
};

const DashboardSidebar = ({ user, dashboardPath, onLogout, onSelect }) => {
  const primaryItems = createPrimaryItems(dashboardPath, user?.role);
  return (
    <aside className="flex h-full flex-col rounded-3xl border border-emerald-200/70 bg-white/85 p-4 backdrop-blur dark:border-emerald-900/40 dark:bg-emerald-950/65">
      <Link
        to="/"
        onClick={onSelect}
        className="group inline-flex items-center gap-2 px-2 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300"
      >
        <Recycle
          size={24}
          className="transition-transform duration-700 group-hover:rotate-180"
        />
        WasteZero
      </Link>

      <div className="mt-8 space-y-6 overflow-y-auto">
        <section>
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/55 dark:text-emerald-100/55">
            Main Menu
          </p>
          <nav className="mt-3 space-y-1">
            {primaryItems.map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                onSelect={onSelect}
                dashboardPath={dashboardPath}
              />
            ))}
          </nav>
        </section>

        <section>
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/55 dark:text-emerald-100/55">
            Settings
          </p>
          <nav className="mt-3 space-y-1">
            {settingsItems.map((item) => (
              <SidebarItem key={item.label} item={item} onSelect={onSelect} />
            ))}
          </nav>
        </section>
      </div>

      <div className="mt-6 space-y-3 border-t border-emerald-200/80 px-2 pt-4 dark:border-emerald-900/45">
        <div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            {user?.name ?? "User"}
          </p>
          <p className="text-xs uppercase tracking-wide text-emerald-900/60 dark:text-emerald-100/60">
            {user?.role ?? "member"}
          </p>
        </div>

        <button
          onClick={onLogout}
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
        >
          <LogOut size={16} />
          Sign Out
        </button>

        <div className="pt-1">
          <ThemeControl compact />
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
