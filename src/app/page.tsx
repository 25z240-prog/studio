import { redirect } from 'next/navigation';

export default function Home() {
  // This is now the single entry point, always redirecting to the login selection.
  redirect('/login');
}
