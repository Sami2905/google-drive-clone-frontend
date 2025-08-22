'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, setUser } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');

        if (!token || !userParam) {
          toast.error('Authentication failed: Missing token or user data');
          router.push('/login');
          return;
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userParam));

        // Store authentication data
        setToken(token);
        setUser(user);

        toast.success('Successfully signed in with Google!');
        
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error processing Google callback:', error);
        toast.error('Authentication failed. Please try again.');
        router.push('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router, setToken, setUser]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return null;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
