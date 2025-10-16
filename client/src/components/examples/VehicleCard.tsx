import VehicleCard from '../VehicleCard';

export default function VehicleCardExample() {
  const vehicle = {
    id: '1',
    name: 'Camión 1',
    licensePlate: 'ABC-1234',
  };

  return (
    <VehicleCard
      vehicle={vehicle}
      onEdit={(veh) => console.log('Edit vehicle:', veh)}
      onDelete={(id) => console.log('Delete vehicle:', id)}
    />
  );
}
