export const getDashboardRoute = (user) => {
  if (user?.role === "admin") return "/admin";
  if (user?.role === "NGO") return "/dashboard/ngo";
  return "/dashboard/volunteer";
};
