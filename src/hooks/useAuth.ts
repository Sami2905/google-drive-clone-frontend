"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

export function useAuth() {
  const { token, user, setUser, setToken, logout, isTokenValid, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize token from localStorage on mount
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!token || user) return;
    let isMounted = true;
    api
      .get("/auth/me")
      .then((res) => {
        if (isMounted) setUser(res.data.user ?? res.data);
      })
      .catch(() => {
        setToken(null);
      });
    return () => {
      isMounted = false;
    };
  }, [token, user, setUser, setToken]);

  // Debug function to check auth status
  const debugAuth = () => {
    console.log('Auth Debug Info:');
    console.log('Token exists:', !!token);
    console.log('Token valid:', isTokenValid());
    console.log('User exists:', !!user);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000));
        console.log('Token expired:', payload.exp < Math.floor(Date.now() / 1000));
      } catch {
        console.log('Invalid token format');
      }
    }
  };

  return { 
    token, 
    user, 
    setUser, 
    setToken, 
    logout, 
    debugAuth,
    isAuthenticated: !!token && isTokenValid()
  };
}


