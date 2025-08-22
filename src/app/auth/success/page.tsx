"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

function OAuthSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      setToken(token);
      toast.success("Signed in with Google!");
      router.replace("/dashboard");
    } else {
      toast.error("Missing token in callback");
      router.replace("/auth/login");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="flex h-screen w-screen items-center justify-center">Redirecting…</div>;
}

export default function OAuthSuccess() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center">Loading...</div>
    }>
      <OAuthSuccessContent />
    </Suspense>
  );
}
