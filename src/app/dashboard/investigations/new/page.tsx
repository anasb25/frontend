import { Header } from '@/components/layout/header';
import { InvestigationForm } from '@/components/investigations/investigation-form';

export default function NewInvestigationPage() {
  return (
    <>
      <Header
        title="New Investigation"
        subtitle="Step 1 — Customer and vehicle investigation"
      />
      <div className="px-3 py-4 sm:px-4">
        <InvestigationForm />
      </div>
    </>
  );
}
