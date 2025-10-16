import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Vehicle, Employee } from "@shared/schema";

interface AssignmentRow {
  id: string;
  role: string;
  employeeId: string;
  time: string;
}

interface AssignmentCardProps {
  vehicle: Vehicle;
  availableEmployees: Employee[];
  availableRoles: string[];
  assignments: AssignmentRow[];
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onUpdateRole: (rowId: string, role: string) => void;
  onUpdateEmployee: (rowId: string, employeeId: string) => void;
  onUpdateTime: (rowId: string, time: string) => void;
}

export default function AssignmentCard({
  vehicle,
  availableEmployees,
  availableRoles,
  assignments = [],
  onAddRow,
  onRemoveRow,
  onUpdateRole,
  onUpdateEmployee,
  onUpdateTime,
}: AssignmentCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_150px_1fr_1fr_auto] gap-4 items-start" data-testid={`card-assignment-${vehicle.id}`}>
      {/* Caja 1: Vehículo */}
      <Card className="p-4 h-full">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-chart-2/10 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5 text-chart-2" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm" data-testid={`text-assignment-vehicle-${vehicle.id}`}>
              {vehicle.name}
            </h3>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              {vehicle.licensePlate}
            </p>
          </div>
        </div>
      </Card>

      {/* Caja 2: Horarios */}
      <Card className="p-4 h-full">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-3">Horario</p>
          {assignments.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">-</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((row) => (
                <Input
                  key={row.id}
                  type="time"
                  value={row.time}
                  onChange={(e) => onUpdateTime(row.id, e.target.value)}
                  className="h-9 text-sm"
                  data-testid={`input-time-${row.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Caja 3: Funciones */}
      <Card className="p-4 h-full">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-3">Función</p>
          {assignments.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Sin asignaciones</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((row) => (
                <Select
                  key={row.id}
                  value={row.role}
                  onValueChange={(value) => onUpdateRole(row.id, value)}
                >
                  <SelectTrigger className="h-9" data-testid={`select-role-${row.id}`}>
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
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Caja 4: Personal */}
      <Card className="p-4 h-full">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-3">Personal</p>
          {assignments.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Sin asignaciones</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((row) => (
                <Select
                  key={row.id}
                  value={row.employeeId}
                  onValueChange={(value) => onUpdateEmployee(row.id, value)}
                >
                  <SelectTrigger className="h-9" data-testid={`select-employee-${row.id}`}>
                    <SelectValue placeholder="Seleccionar personal" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Botones de acción */}
      <div className="flex flex-col gap-2 pt-7">
        <Button
          size="icon"
          variant="outline"
          onClick={onAddRow}
          data-testid={`button-add-row-${vehicle.id}`}
        >
          <Plus className="w-4 h-4" />
        </Button>
        {assignments.length > 0 && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => onRemoveRow(assignments[assignments.length - 1].id)}
            data-testid={`button-remove-row-${vehicle.id}`}
          >
            <X className="w-4 h-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}
