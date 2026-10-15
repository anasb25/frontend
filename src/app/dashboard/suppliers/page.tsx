import { Header } from '@/components/layout/header';
import { SuppliersPanel } from '@/components/suppliers/suppliers-panel';

export default function SuppliersPage() {
  return (
    <>
      <Header title="Suppliers" subtitle="Master data — spare parts vendors" />
      <div className="p-6">
        <SuppliersPanel />
      </div>
    </>
  );
}
