import { Header } from '@/components/layout/header';
import { SparePartsPanel } from '@/components/spare-parts/spare-parts-panel';

export default function SparePartsPage() {
  return (
    <>
      <Header
        title="Spare Parts"
        subtitle="Part name catalog — category chosen per estimate"
      />
      <div className="p-6">
        <SparePartsPanel />
      </div>
    </>
  );
}
