import { getGrievances } from "@/lib/data-manager";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; user?: string }>;
}) {
  const params = await searchParams;
  const role = params.role || 'individual';
  const username = params.user || 'anonymous';
  
  const initialGrievances = getGrievances();

  return (
    <DashboardClient 
      role={role} 
      username={username} 
      initialGrievances={initialGrievances} 
    />
  );
}
