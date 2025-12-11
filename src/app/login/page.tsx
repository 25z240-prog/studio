
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page now only serves to redirect. 
// If a user somehow navigates to /login, we send them back to the root to choose a role.
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null; // Render nothing while redirecting
}
