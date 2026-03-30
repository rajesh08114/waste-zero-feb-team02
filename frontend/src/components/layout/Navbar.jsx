import { Menu, Recycle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { SITE_NAME } from "../../constants/site";
import { getDashboardRoute } from "../../utils/dashboardRoute";
import ThemeControl from "../theme/ThemeControl";

const sectionLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#contact", label: "Contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const currentUser = useAppStore((state) => state.currentUser);

  const dashboardPath = useMemo(() => getDashboardRoute(currentUser), [currentUser]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-200/70 bg-white/85 backdrop-blur dark:border-emerald-900/60 dark:bg-emerald-950/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="group inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300"
        >
          <Recycle
            size={22}
            className="transition-transform duration-700 group-hover:rotate-180"
          />
          {SITE_NAME}
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {sectionLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-emerald-900 transition hover:text-emerald-600 dark:text-emerald-200 dark:hover:text-emerald-300"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeControl compact />
          {isAuthenticated ? (
            <>
              <Link
                to={currentUser?.role === "admin" ? "/admin/users" : "/opportunities"}
                className="rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
              >
                {currentUser?.role === "admin" ? "Users" : "Opportunities"}
              </Link>
              {currentUser?.role === "NGO" && (
                <Link
                  to="/opportunities/create"
                  className="rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
                >
                  Create
                </Link>
              )}
              <Link
                to={dashboardPath}
                className="rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
              >
                My Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 text-emerald-700 lg:hidden dark:border-emerald-800 dark:text-emerald-200"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-emerald-200/70 px-4 pb-4 pt-3 lg:hidden dark:border-emerald-900/60">
          <div className="grid gap-2">
            {sectionLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100/80 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ThemeControl compact />
            {isAuthenticated ? (
              <>
                <Link
                  to={currentUser?.role === "admin" ? "/admin/users" : "/opportunities"}
                  onClick={closeMenu}
                  className="rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-400 dark:text-emerald-200"
                >
                  {currentUser?.role === "admin" ? "Users" : "Opportunities"}
                </Link>
                {currentUser?.role === "NGO" && (
                  <Link
                    to="/opportunities/create"
                    onClick={closeMenu}
                    className="rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-400 dark:text-emerald-200"
                  >
                    Create
                  </Link>
                )}
                <Link
                  to={dashboardPath}
                  onClick={closeMenu}
                  className="rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-400 dark:text-emerald-200"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  My Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-400 dark:text-emerald-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
