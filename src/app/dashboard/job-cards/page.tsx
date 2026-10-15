import { Header } from '@/components/layout/header';
import { JobCardsPanel } from '@/components/job-cards/job-cards-panel';

export default function JobCardsPage() {
  return (
    <>
      <Header title="Job Cards" subtitle="Step 3 — Workshop job cards from estimates" />
      <div className="p-6">
        <JobCardsPanel />
      </div>
    </>
  );
}
