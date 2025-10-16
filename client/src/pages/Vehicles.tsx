import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";
import VehicleDialog from "@/components/VehicleDialog";
import type { Vehicle } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Vehicles() {
  // TODO: remove mock functionality - replace with real data
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: '1', name: 'Camión 1', licensePlate: 'ABC-1234' },
    { id: '2', name: 'Camión 2', licensePlate: 'DEF-5678' },
    { id: '3', name: 'Furgoneta 1', licensePlate: 'GHI-9012' },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setSelectedVehicle(null);
    setDialogOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setVehicleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      // TODO: remove mock functionality - implement API call
      setVehicles(vehicles.filter(v => v.id !== vehicleToDelete));
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    }
  };

  const handleSave = (vehicleData: { name: string; licensePlate: string }, id?: string) => {
    // TODO: remove mock functionality - implement API call
    if (id) {
      setVehicles(vehicles.map(v => v.id === id ? { ...v, ...vehicleData } : v));
    } else {
      const newVehicle: Vehicle = {
        id: String(Date.now()),
        ...vehicleData,
      };
      setVehicles([...vehicles, newVehicle]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-vehicles-title">
                Vehículos
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiona la flota de vehículos
              </p>
            </div>
            <Button onClick={handleAdd} className="gap-2" data-testid="button-add-vehicle">
              <Plus className="w-4 h-4" />
              Nuevo Vehículo
            </Button>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No hay vehículos registrados</p>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Agregar Primer Vehículo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <VehicleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vehicle={selectedVehicle}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El vehículo será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
