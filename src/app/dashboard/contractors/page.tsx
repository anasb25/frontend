import { Header } from '@/components/layout/header';
import { ContractorsPanel } from '@/components/contractors/contractors-panel';

export default function ContractorsPage() {
  return (
    <>
      <Header title="Contractors" subtitle="Insurance contractors for job cards" />
      <div className="p-6">
        <ContractorsPanel />
      </div>
    </>
  );
}
