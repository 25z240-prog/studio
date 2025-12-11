'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page just redirects to the main role selection.
export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
