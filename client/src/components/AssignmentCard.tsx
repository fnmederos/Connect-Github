import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Truck, Plus, X, ChevronUp, ChevronDown } from "lucide-react";
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
  comments: string;
  allAssignedEmployeeIds: Set<string>;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onUpdateRole: (rowId: string, role: string) => void;
  onUpdateEmployee: (rowId: string, employeeId: string) => void;
  onUpdateTime: (rowId: string, time: string) => void;
  onUpdateComments: (comments: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function AssignmentCard({
  vehicle,
  availableEmployees,
  availableRoles,
  assignments = [],
  comments,
  allAssignedEmployeeIds,
  canMoveUp,
  canMoveDown,
  onAddRow,
  onRemoveRow,
  onUpdateRole,
  onUpdateEmployee,
  onUpdateTime,
  onUpdateComments,
  onMoveUp,
  onMoveDown,
}: AssignmentCardProps) {
  return (
    <Card className="p-3" data-testid={`card-assignment-${vehicle.id}`}>
      {/* Encabezado: Vehículo */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-md bg-chart-2/10 flex items-center justify-center flex-shrink-0">
          <Truck className="w-4 h-4 text-chart-2" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-tight" data-testid={`text-assignment-vehicle-${vehicle.id}`}>
            {vehicle.name}
          </h3>
          <p className="text-xs font-mono text-muted-foreground leading-tight">
            {vehicle.licensePlate}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={onMoveUp}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={!canMoveUp}
            data-testid={`button-move-up-${vehicle.id}`}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            onClick={onMoveDown}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={!canMoveDown}
            data-testid={`button-move-down-${vehicle.id}`}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filas de asignaciones - Lista compacta */}
      <div className="space-y-1">
        {assignments.map((row) => {
          // Filtrar empleados por rol seleccionado Y excluir ya asignados (excepto el actual)
          const filteredEmployees = availableEmployees.filter(emp => {
            // Filtrar por rol si está seleccionado
            const hasRole = row.role ? emp.roles.includes(row.role) : true;
            
            // Excluir empleados ya asignados, excepto el de esta fila
            const isAlreadyAssigned = allAssignedEmployeeIds.has(emp.id) && emp.id !== row.employeeId;
            
            return hasRole && !isAlreadyAssigned;
          });

          return (
            <div key={row.id} className="grid grid-cols-[90px_140px_1fr_auto] gap-1.5 items-center">
              {/* Horario */}
              <Input
                type="time"
                value={row.time}
                onChange={(e) => onUpdateTime(row.id, e.target.value)}
                className="h-8 text-xs"
                data-testid={`input-time-${row.id}`}
              />

              {/* Función */}
              <Select
                value={row.role}
                onValueChange={(value) => onUpdateRole(row.id, value)}
              >
                <SelectTrigger className="h-8 text-xs" data-testid={`select-role-${row.id}`}>
                  <SelectValue placeholder="Función" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Personal */}
              <Select
                value={row.employeeId}
                onValueChange={(value) => onUpdateEmployee(row.id, value)}
              >
                <SelectTrigger className="h-8 text-xs" data-testid={`select-employee-${row.id}`}>
                  <SelectValue placeholder="Personal" />
                </SelectTrigger>
                <SelectContent>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-employees" disabled>
                      No hay personal con esta función
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Botón eliminar */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRemoveRow(row.id)}
                className="h-8 w-8"
                data-testid={`button-remove-row-${row.id}`}
              >
                <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Botón agregar */}
      <div className="mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddRow}
          className="gap-1 h-7 text-xs"
          data-testid={`button-add-row-${vehicle.id}`}
        >
          <Plus className="w-3 h-3" />
          Agregar línea
        </Button>
      </div>

      {/* Campo de comentarios para este vehículo */}
      <div className="mt-3">
        <Textarea
          value={comments}
          onChange={(e) => onUpdateComments(e.target.value)}
          placeholder="Comentarios para este vehículo..."
          className="min-h-[60px] text-xs resize-none"
          data-testid={`textarea-comments-${vehicle.id}`}
        />
      </div>
    </Card>
  );
}
