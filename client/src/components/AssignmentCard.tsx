import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  comments: string;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onUpdateRole: (rowId: string, role: string) => void;
  onUpdateEmployee: (rowId: string, employeeId: string) => void;
  onUpdateTime: (rowId: string, time: string) => void;
  onUpdateComments: (comments: string) => void;
}

export default function AssignmentCard({
  vehicle,
  availableEmployees,
  availableRoles,
  assignments = [],
  comments,
  onAddRow,
  onRemoveRow,
  onUpdateRole,
  onUpdateEmployee,
  onUpdateTime,
  onUpdateComments,
}: AssignmentCardProps) {
  return (
    <Card className="p-6" data-testid={`card-assignment-${vehicle.id}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[200px_150px_1fr_1fr] gap-4 mb-4">
        {/* Encabezado: Vehículo */}
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

        {/* Encabezados de columnas */}
        <p className="text-xs font-medium text-muted-foreground">Horario</p>
        <p className="text-xs font-medium text-muted-foreground">Función</p>
        <p className="text-xs font-medium text-muted-foreground">Personal</p>
      </div>

      {/* Filas de asignaciones */}
      <div className="space-y-2">
        {assignments.map((row) => (
          <div key={row.id} className="grid grid-cols-1 lg:grid-cols-[200px_150px_1fr_1fr_auto] gap-4 items-center">
            {/* Espacio vacío para alinear con el vehículo */}
            <div></div>
            
            {/* Horario */}
            <Input
              type="time"
              value={row.time}
              onChange={(e) => onUpdateTime(row.id, e.target.value)}
              className="h-9 text-sm"
              data-testid={`input-time-${row.id}`}
            />

            {/* Función */}
            <Select
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

            {/* Personal */}
            <Select
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

            {/* Botón eliminar */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRemoveRow(row.id)}
              data-testid={`button-remove-row-${row.id}`}
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Botón agregar */}
      <div className="mt-3 pl-[200px] lg:pl-[200px]">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddRow}
          className="gap-2 h-8"
          data-testid={`button-add-row-${vehicle.id}`}
        >
          <Plus className="w-3 h-3" />
          Agregar línea
        </Button>
      </div>

      {/* Campo de comentarios para este vehículo */}
      <div className="mt-4">
        <Textarea
          value={comments}
          onChange={(e) => onUpdateComments(e.target.value)}
          placeholder="Comentarios para este vehículo..."
          className="min-h-[80px] text-sm"
          data-testid={`textarea-comments-${vehicle.id}`}
        />
      </div>
    </Card>
  );
}
