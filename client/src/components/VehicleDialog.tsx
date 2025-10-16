import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import type { Vehicle } from "@shared/schema";

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
  onSave: (vehicle: { name: string; licensePlate: string }, id?: string) => void;
}

export default function VehicleDialog({ open, onOpenChange, vehicle, onSave }: VehicleDialogProps) {
  const [name, setName] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  useEffect(() => {
    if (vehicle) {
      setName(vehicle.name);
      setLicensePlate(vehicle.licensePlate);
    } else {
      setName("");
      setLicensePlate("");
    }
  }, [vehicle, open]);

  const handleSave = () => {
    if (name.trim() && licensePlate.trim()) {
      onSave({ name: name.trim(), licensePlate: licensePlate.trim() }, vehicle?.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-vehicle">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Editar Vehículo" : "Nuevo Vehículo"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle-name">Nombre</Label>
            <Input
              id="vehicle-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Camión 1"
              data-testid="input-vehicle-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle-plate">Matrícula</Label>
            <Input
              id="vehicle-plate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="Ej: ABC-1234"
              data-testid="input-vehicle-plate"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-vehicle">
            Cancelar
          </Button>
          <Button onClick={handleSave} data-testid="button-save-vehicle">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
