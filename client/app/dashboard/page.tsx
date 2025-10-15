import { auth } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import Dashboard from '@/components/dashboard';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <Dashboard />;
}