import { useContext } from "react";

import { Navigate, Outlet } from "react-router-dom";
import { Authcontext } from "../authcontext/Authcontext";

export function PrivateRoute() {
  const { profile: user, loading } = useContext(Authcontext);   // sirf rename, baaki same

  // auth check hone tak kuch mat dikhao
  if (loading) return null;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}