import { Header } from '@/components/layout/header';
import { InvestigationsPanel } from '@/components/investigations/investigations-panel';

export default function InvestigationsPage() {
  return (
    <>
      <Header
        title="Investigations"
        subtitle="Vehicle intake and damage investigations"
      />
      <div className="p-6">
        <InvestigationsPanel />
      </div>
    </>
  );
}
