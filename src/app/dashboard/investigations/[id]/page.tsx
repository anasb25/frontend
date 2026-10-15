import { InvestigationDetail } from '@/components/investigations/investigation-detail';

export default async function InvestigationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvestigationDetail id={id} />;
}
