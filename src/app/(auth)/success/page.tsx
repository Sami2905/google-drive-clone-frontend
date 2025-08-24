"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

function OAuthSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    if (!params) return;
    
    const token = params.get("token");
    if (token) {
      // Persist for api lib + reloads
      localStorage.setItem("token", token);
      setToken(token);
      toast.success("Signed in with Google!");
      router.replace("/dashboard");
    } else {
      toast.error("Missing token in callback");
      router.replace("/auth/login");
    }
  }, [params, setToken, router]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen w-screen items-center justify-center text-slate-600 dark:text-slate-300">
      Redirecting…
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center text-slate-600 dark:text-slate-300">
        Loading...
      </div>
    }>
      <OAuthSuccessContent />
    </Suspense>
  );
}
