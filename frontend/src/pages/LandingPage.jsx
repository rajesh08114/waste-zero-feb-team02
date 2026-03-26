import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { getDashboardRoute } from "../utils/dashboardRoute";
import heroImage from "../assets/hero.png";
import aboutImage from "../assets/about.png";
import howImage from "../assets/how.png";

const LandingPage = () => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const currentUser = useAppStore((state) => state.currentUser);
  const dashboardPath = getDashboardRoute(currentUser);

  return (
    <div
      className="
    scroll-smooth
    min-h-screen
    bg-linear-to-r
    from-green-100 via-green-200 to-green-300
    text-gray-800
    dark:from-[#0F2E1C]
    dark:via-[#123524]
    dark:to-[#0B3D2E]
    dark:text-gray-200
  "
    >
      <Navbar />
      {/* HERO SECTION */}
      <section id="home" className="px-6 pt-16 pb-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          {/* LEFT CONTENT */}
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-[#14532D] dark:text-emerald-200">
              Together We Build
              <br />
              <span className="text-[#16A34A]">a Cleaner</span>
              <br />
              <span className="text-[#10B981]">Tomorrow</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-lg">
              Join thousands of volunteers reducing waste and creating real
              environmental impact.
            </p>

            {/* BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  to={dashboardPath}
                  className="rounded-full bg-[#16A34A] px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#15803D]"
                >
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="rounded-full bg-[#16A34A] px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#15803D]"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-full border-2 border-[#16A34A] px-8 py-3 font-semibold text-[#16A34A] transition hover:bg-[#16A34A] hover:text-white"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* STATS */}
            <div className="mt-12 flex gap-10 text-[#14532D] dark:text-emerald-200 font-semibold">
              <div>
                <p className="text-2xl">10K+</p>
                <p className="text-sm text-gray-600">Volunteers</p>
              </div>
              <div>
                <p className="text-2xl">500+</p>
                <p className="text-sm text-gray-600">Clean-up Drives</p>
              </div>
              <div>
                <p className="text-2xl">20+</p>
                <p className="text-sm text-gray-600">Partner NGOs</p>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex justify-center">
            <img
              src={heroImage}
              alt="WasteZero"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </section>
      {/*ABOUT SECTION*/}
      <section
        id="about"
        className="relative pt-8 pb-24 bg-linear-to-b from-[#FBFFE4] to-white dark:from-[#0F2E1C] dark:to-[#123524] px-6 lg:px-20 overflow-hidden"
      >
        {/* Soft background glow */}
        <div className="absolute right-0 top-10 w-100 h-100 bg-[#B3D8A8]/30 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl grid lg:grid-cols-2 gap-20 items-center">
          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#3D8D7A] leading-tight">
              What is <span className="text-[#2F6F60]">WasteZero?</span>
            </h2>

            <p className="mt-8 text-lg text-gray-600 leading-relaxed max-w-xl">
              WasteZero is a community-driven sustainability platform that
              connects volunteers, NGOs, and administrators to reduce
              environmental waste through real-world action.
            </p>

            <div className="mt-10 space-y-5">
              {[
                "Schedule waste pickups easily",
                "Join local clean-up drives",
                "Track your environmental impact",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 bg-white dark:bg-[#1B4332] px-6 py-4 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-[#B3D8A8] rounded-full text-[#3D8D7A] font-bold">
                    <Check size={16} />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative flex justify-center">
            <div className="absolute w-87.5 h-87.5 bg-[#A3D1C6]/40 rounded-full blur-3xl"></div>

            <img
              src={aboutImage}
              alt="WasteZero recycling"
              className="w-87.5 md:w-125 lg:w-150 object-contain"
            />
          </div>
        </div>
      </section>
      {/*HOW IT WORKS*/}
      <section
        id="how-it-works"
        className="py-28 bg-[#FBFFE4] dark:bg-[#0F2E1C] px-6 lg:px-20 overflow-hidden"
      >
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-20 items-center">
          {/* LEFT IMAGE */}
          <div className="relative flex justify-center">
            {/* Glow background */}
            <div className="absolute w-87.5 h-87.5 bg-[#B3D8A8]/40 rounded-full blur-3xl"></div>

            <img
              src={howImage}
              alt="How WasteZero Works"
              className="max-w-xl"
            />
          </div>

          {/* RIGHT CONTENT */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#3D8D7A]">
              How WasteZero Works
            </h2>

            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
              Simple steps to create real environmental impact.
            </p>

            <div className="mt-12 space-y-10">
              {/* STEP 1 */}
              <div className="flex gap-6">
                <div className="flex items-center justify-center w-14 h-14 bg-[#3D8D7A] text-white rounded-full font-bold text-lg shadow-lg">
                  01
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2F6F60]">
                    Sign Up
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Create your account and join the sustainability movement.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="flex gap-6">
                <div className="flex items-center justify-center w-14 h-14 bg-[#3D8D7A] text-white rounded-full font-bold text-lg shadow-lg">
                  02
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2F6F60]">
                    Take Action
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Participate in clean-up drives or schedule pickups.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex gap-6">
                <div className="flex items-center justify-center w-14 h-14 bg-[#3D8D7A] text-white rounded-full font-bold text-lg shadow-lg">
                  03
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2F6F60]">
                    Track Impact
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Monitor your contribution and real-world results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*CTA*/}
      <section className="bg-[#3D8D7A] dark:bg-[#123524] py-20 px-6 lg:px-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Make a Difference?
          </h2>

          <p className="mt-4 text-lg text-[#E6F4EA]">
            Be part of a growing community working toward a cleaner planet.
          </p>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                className="bg-white text-[#3D8D7A] px-8 py-3 rounded-full font-semibold shadow-md hover:scale-105 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-white text-[#3D8D7A] px-8 py-3 rounded-full font-semibold shadow-md hover:scale-105 transition"
                >
                  Join the Movement
                </Link>

                <Link
                  to="/login"
                  className="border-2 border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[#3D8D7A] transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;
