import { redirect } from 'next/navigation';

// The unified login at /dashboard/login handles both admin and client authentication.
// Visiting /admin/login directly will redirect there.
export default function AdminLoginRedirect() {
  redirect('/dashboard/login');
}
