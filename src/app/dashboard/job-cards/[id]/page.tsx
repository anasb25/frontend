import { JobCardEditor } from '@/components/job-cards/job-card-editor';

export default async function JobCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobCardEditor id={id} />;
}
