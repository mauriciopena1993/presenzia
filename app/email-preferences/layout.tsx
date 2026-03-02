import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Preferences | presenzia.ai',
  description: 'Manage your email communication preferences for presenzia.ai.',
  robots: { index: false, follow: false },
};

export default function EmailPreferencesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
