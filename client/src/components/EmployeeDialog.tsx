import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import type { Employee } from "@shared/schema";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (employee: { name: string; roles: string[]; allowDuplicates: boolean }, id?: string) => void;
  availableRoles: string[];
}

export default function EmployeeDialog({ open, onOpenChange, employee, onSave, availableRoles }: EmployeeDialogProps) {
  const [name, setName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState("");
  const [allowDuplicates, setAllowDuplicates] = useState(false);

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setSelectedRoles(employee.roles || []);
      setAllowDuplicates(employee.allowDuplicates || false);
    } else {
      setName("");
      setSelectedRoles([]);
      setAllowDuplicates(false);
    }
    setCurrentRole("");
  }, [employee, open]);

  const handleAddRole = () => {
    if (currentRole && !selectedRoles.includes(currentRole)) {
      setSelectedRoles([...selectedRoles, currentRole]);
      setCurrentRole("");
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setSelectedRoles(selectedRoles.filter(r => r !== roleToRemove));
  };

  const handleSave = () => {
    if (name.trim() && selectedRoles.length > 0) {
      onSave({ name: name.trim(), roles: selectedRoles, allowDuplicates }, employee?.id);
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

          <div className="flex items-start space-x-3 rounded-md border p-4">
            <Checkbox
              id="allow-duplicates"
              checked={allowDuplicates}
              onCheckedChange={(checked) => setAllowDuplicates(checked === true)}
              data-testid="checkbox-allow-duplicates"
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="allow-duplicates"
                className="text-sm font-medium cursor-pointer"
              >
                Permitir duplicados
              </Label>
              <p className="text-sm text-muted-foreground">
                Este empleado puede ser asignado múltiples veces en el mismo vehículo o en diferentes vehículos. Útil para empleados tercerizados o empresas contratistas.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Funciones</Label>
            <div className="flex gap-2">
              <Select value={currentRole} onValueChange={setCurrentRole}>
                <SelectTrigger className="flex-1" data-testid="select-employee-role">
                  <SelectValue placeholder="Seleccionar función" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                onClick={handleAddRole}
                disabled={!currentRole || selectedRoles.includes(currentRole)}
                data-testid="button-add-role"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {selectedRoles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedRoles.map((role) => (
                  <Badge 
                    key={role} 
                    variant="secondary" 
                    className="gap-1 pr-1"
                    data-testid={`badge-role-${role}`}
                  >
                    {role}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveRole(role)}
                      data-testid={`button-remove-role-${role}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-employee">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || selectedRoles.length === 0} data-testid="button-save-employee">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
