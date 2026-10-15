import { VehicleColorsPanel } from '@/components/vehicle-colors/vehicle-colors-panel';
import { Header } from '@/components/layout/header';

export default function VehicleColorsPage() {
  return (
    <>
      <Header
        title="Vehicle Colors"
        subtitle="Manage vehicle color catalog"
      />
      <div className="p-6">
        <VehicleColorsPanel />
      </div>
    </>
  );
}
