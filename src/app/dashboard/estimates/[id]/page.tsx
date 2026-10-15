import { EstimateDetail } from '@/components/estimates/estimate-detail';

export default async function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EstimateDetail id={id} />;
}
