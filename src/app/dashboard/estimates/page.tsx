import { Header } from '@/components/layout/header';
import { EstimatesPanel } from '@/components/estimates/estimates-panel';

export default function EstimatesPage() {
  return (
    <>
      <Header title="Estimates" subtitle="Step 2 — Job estimates from investigations" />
      <div className="p-6">
        <EstimatesPanel />
      </div>
    </>
  );
}
