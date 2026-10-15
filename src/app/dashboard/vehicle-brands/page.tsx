import { VehicleBrandsPanel } from '@/components/vehicle-brands/vehicle-brands-panel';
import { Header } from '@/components/layout/header';

export default function VehicleBrandsPage() {
  return (
    <>
      <Header
        title="Vehicle Brands"
        subtitle="Manage vehicle manufacturers and status"
      />
      <div className="p-6">
        <VehicleBrandsPanel />
      </div>
    </>
  );
}
