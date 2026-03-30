import { Recycle } from "lucide-react";
import { SITE_NAME } from "../../constants/site";

const AppLoader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-emerald-950 dark:via-slate-950 dark:to-emerald-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <span className="absolute inset-0 rounded-full border-2 border-emerald-300/70 animate-ping dark:border-emerald-700/70" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-white/90 shadow-xl dark:border-emerald-800 dark:bg-emerald-950/80">
            <Recycle className="h-10 w-10 animate-[spin_1.4s_linear_infinite] text-emerald-600 dark:text-emerald-300" />
          </div>
        </div>

        <p className="text-sm font-semibold tracking-wide text-emerald-700 dark:text-emerald-300">
          Loading {SITE_NAME}...
        </p>
      </div>
    </div>
  );
};

export default AppLoader;
