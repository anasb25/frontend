import { VehicleModelsPanel } from '@/components/vehicle-models/vehicle-models-panel';
import { Header } from '@/components/layout/header';

export default function VehicleModelsPage() {
  return (
    <>
      <Header
        title="Vehicle Models"
        subtitle="Define models linked to vehicle brands"
      />
      <div className="p-6">
        <VehicleModelsPanel />
      </div>
    </>
  );
}
