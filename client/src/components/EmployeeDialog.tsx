import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import type { Employee } from "@shared/schema";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (employee: { name: string; role: string }, id?: string) => void;
}

export default function EmployeeDialog({ open, onOpenChange, employee, onSave }: EmployeeDialogProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setRole(employee.role);
    } else {
      setName("");
      setRole("");
    }
  }, [employee, open]);

  const handleSave = () => {
    if (name.trim() && role.trim()) {
      onSave({ name: name.trim(), role: role.trim() }, employee?.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-employee">
        <DialogHeader>
          <DialogTitle>{employee ? "Editar Empleado" : "Nuevo Empleado"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee-name">Nombre</Label>
            <Input
              id="employee-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              data-testid="input-employee-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee-role">Función</Label>
            <Input
              id="employee-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ej: Conductor"
              data-testid="input-employee-role"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-employee">
            Cancelar
          </Button>
          <Button onClick={handleSave} data-testid="button-save-employee">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
