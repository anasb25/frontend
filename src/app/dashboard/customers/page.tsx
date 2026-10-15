import { CustomersPanel } from '@/components/customers/customers-panel';
import { Header } from '@/components/layout/header';

export default function CustomersPage() {
  return (
    <>
      <Header
        title="Customers"
        subtitle="Manage customer profiles and contact information"
      />
      <div className="p-6">
        <CustomersPanel />
      </div>
    </>
  );
}
