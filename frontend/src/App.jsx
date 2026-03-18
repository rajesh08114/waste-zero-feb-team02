import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLoader from "./components/common/AppLoader";
import RealtimeBridge from "./components/common/RealtimeBridge";
import DashboardLayout from "./components/layout/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyEmail from "./pages/VerifyEmail";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import NGODashboard from "./pages/NGODashboard";
import ProfilePage from "./pages/ProfilePage";
import CreateOpportunity from "./pages/CreateOpportunity";
import EditOpportunity from "./pages/EditOpportunity";
import NGOOpportunities from "./pages/NGOOpportunities";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import OpportunityDetailsPage from "./pages/OpportunityDetailsPage";
import MatchesPage from "./pages/MatchesPage";
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";
import { useAppStore } from "./store/useAppStore";

const getDashboardRoute = (user) =>
  user?.role === "NGO" ? "/dashboard/ngo" : "/dashboard/volunteer";

const PublicOnlyRoute = ({ children }) => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const currentUser = useAppStore((state) => state.currentUser);

  if (isAuthenticated) {
    return <Navigate to={getDashboardRoute(currentUser)} replace />;
  }

  return children;
};

function App() {
  const authReady = useAppStore((state) => state.authReady);
  const initializeAuth = useAppStore((state) => state.initializeAuth);
  const hasInitialized = useRef(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashDone(true), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  if (!authReady || !splashDone) return <AppLoader />;

  return (
    <BrowserRouter>
      <RealtimeBridge />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/dashboard/volunteer"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <DashboardLayout>
                <VolunteerDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/opportunities"
          element={
            <ProtectedRoute allowedRoles={["volunteer", "NGO"]}>
              <DashboardLayout>
                <OpportunitiesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/opportunities/:id"
          element={
            <ProtectedRoute allowedRoles={["volunteer", "NGO"]}>
              <DashboardLayout>
                <OpportunityDetailsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/matches"
          element={
            <ProtectedRoute allowedRoles={["volunteer", "NGO"]}>
              <DashboardLayout>
                <MatchesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={["volunteer", "NGO"]}>
              <DashboardLayout>
                <MessagesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:userId"
          element={
            <ProtectedRoute allowedRoles={["volunteer", "NGO"]}>
              <DashboardLayout>
                <ChatPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/opportunities/create"
          element={
            <ProtectedRoute allowedRoles={["NGO"]}>
              <DashboardLayout>
                <CreateOpportunity />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/ngo"
          element={
            <ProtectedRoute allowedRoles={["NGO"]}>
              <DashboardLayout>
                <NGODashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/opportunities/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["NGO"]}>
              <DashboardLayout>
                <EditOpportunity />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/volunteer/opportunities"
          element={<Navigate to="/opportunities" replace />}
        />

        <Route
          path="/dashboard/ngo/opportunities"
          element={
            <ProtectedRoute allowedRoles={["NGO"]}>
              <DashboardLayout>
                <NGOOpportunities />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/ngo/create"
          element={<Navigate to="/opportunities/create" replace />}
        />

        <Route
          path="/dashboard/ngo/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["NGO"]}>
              <DashboardLayout>
                <EditOpportunity />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
