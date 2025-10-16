import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Vehicle } from "@shared/schema";

interface VehicleSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  selectedVehicleIds: string[];
  onConfirm: (vehicleIds: string[]) => void;
}

export default function VehicleSelectionDialog({
  open,
  onOpenChange,
  vehicles,
  selectedVehicleIds,
  onConfirm,
}: VehicleSelectionDialogProps) {
  const [tempSelected, setTempSelected] = useState<string[]>(selectedVehicleIds);

  useEffect(() => {
    if (open) {
      setTempSelected(selectedVehicleIds);
    }
  }, [open, selectedVehicleIds]);

  const handleToggle = (vehicleId: string) => {
    setTempSelected(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleSelectAll = () => {
    setTempSelected(vehicles.map(v => v.id));
  };

  const handleDeselectAll = () => {
    setTempSelected([]);
  };

  const handleConfirm = () => {
    onConfirm(tempSelected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-vehicle-selection">
        <DialogHeader>
          <DialogTitle>Seleccionar Vehículos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              data-testid="button-select-all-vehicles"
            >
              Seleccionar Todos
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              data-testid="button-deselect-all-vehicles"
            >
              Deseleccionar Todos
            </Button>
          </div>
          
          {vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay vehículos registrados. Agrega vehículos desde la sección de Vehículos.
            </p>
          ) : (
            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center space-x-3 p-2 rounded-md hover-elevate"
                    data-testid={`vehicle-option-${vehicle.id}`}
                  >
                    <Checkbox
                      id={`vehicle-${vehicle.id}`}
                      checked={tempSelected.includes(vehicle.id)}
                      onCheckedChange={() => handleToggle(vehicle.id)}
                      data-testid={`checkbox-vehicle-${vehicle.id}`}
                    />
                    <label
                      htmlFor={`vehicle-${vehicle.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{vehicle.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Patente: {vehicle.licensePlate}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <p className="text-sm text-muted-foreground">
            {tempSelected.length} vehículo{tempSelected.length !== 1 ? 's' : ''} seleccionado{tempSelected.length !== 1 ? 's' : ''}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-vehicle-selection"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={tempSelected.length === 0}
            data-testid="button-confirm-vehicle-selection"
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
