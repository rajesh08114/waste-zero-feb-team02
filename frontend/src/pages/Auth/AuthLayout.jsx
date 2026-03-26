import { Recycle } from "lucide-react";
import { SITE_NAME } from "../../constants/site";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT SIDE - YOUR UI */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center text-white overflow-hidden">
        {/* Background image */}
        <img
          src="/auth-bg.jpg"
          alt="WasteZero background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Green overlay */}
        <div className="absolute inset-0 bg-emerald-700/60"></div>

        {/* Content */}
        <div className="relative z-10 px-12">
          <div className="flex items-center gap-3 mb-6">
            <Recycle size={40} className="animate-spin-slow" />
            <h1 className="text-4xl font-bold tracking-wide">{SITE_NAME}</h1>
          </div>

          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Empower <span className="text-emerald-300">Change</span> Together
          </h2>

          <p className="text-lg text-emerald-100/90 max-w-xl">
            Join a global movement for sustainable living. {SITE_NAME} connects
            people, NGOs, and volunteers to create a cleaner, greener world.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - FORM AREA */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-slate-950 px-4 sm:px-6 py-8 sm:py-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
