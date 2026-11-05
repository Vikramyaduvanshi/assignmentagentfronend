import { createContext, useContext, useEffect, useState } from "react";

// const API_BASE = "http://127.0.0.1:8000";
import {Base} from "../api.js"

export const Authcontext = createContext(null);

export function Authprovider({ children }) {
  const [profile, setProfile] = useState(null);   // roles ki list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchProfile(signal) {            // signal optional hai
    try {
      const res = await fetch(`${Base}/auth8178/profile`, {
        method: "POST",
        credentials: "include",            // cookies bhejne ke liye zaroori
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: "profile" }),
        signal,
      });

      if (!res.ok) throw new Error(`Profile fetch failed (${res.status})`);

      const data = await res.json();
      setProfile(data.result);              // sirf roles ki array store ki
      setError(null);
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal);
    return () => controller.abort();          // unmount par request cancel
  }, []);

  return (
    <Authcontext.Provider value={{ profile, loading, error, fetchProfile }}>
      {children}
    </Authcontext.Provider>
  );
}

// chhota hook, taaki har jagah useContext(Authcontext) na likhna pade
export function useAuth() {
  return useContext(Authcontext);
}