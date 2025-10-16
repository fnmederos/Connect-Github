import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  // Fetch vehicles from API
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

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

  // Mutation to delete vehicle
  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    },
  });

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicleMutation.mutate(vehicleToDelete);
    }
  };

  // Mutation to save vehicle (create or update)
  const saveVehicleMutation = useMutation({
    mutationFn: async ({ data, id }: { data: { name: string; licensePlate: string }, id?: string }) => {
      if (id) {
        const response = await fetch(`/api/vehicles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update vehicle');
        return response.json();
      } else {
        const response = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create vehicle');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      setDialogOpen(false);
    },
  });

  const handleSave = (vehicleData: { name: string; licensePlate: string }, id?: string) => {
    saveVehicleMutation.mutate({ data: vehicleData, id });
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
