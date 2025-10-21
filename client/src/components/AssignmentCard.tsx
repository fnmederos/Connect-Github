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
  loadingStatus: string;
  allAssignedEmployeeIds: Set<string>;
  totalVehicles: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onUpdateRole: (rowId: string, role: string) => void;
  onUpdateEmployee: (rowId: string, employeeId: string) => void;
  onUpdateTime: (rowId: string, time: string) => void;
  onUpdateComments: (comments: string) => void;
  onUpdateLoadingStatus: (status: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function AssignmentCard({
  vehicle,
  availableEmployees,
  availableRoles,
  assignments = [],
  comments,
  loadingStatus,
  allAssignedEmployeeIds,
  totalVehicles,
  canMoveUp,
  canMoveDown,
  onAddRow,
  onRemoveRow,
  onUpdateRole,
  onUpdateEmployee,
  onUpdateTime,
  onUpdateComments,
  onUpdateLoadingStatus,
  onMoveUp,
  onMoveDown,
}: AssignmentCardProps) {
  // Generar opciones de estado de carga dinámicamente
  const loadingStatusOptions = [
    { value: "CARGADO", label: "CARGADO" },
    ...Array.from({ length: totalVehicles - 1 }, (_, i) => ({
      value: `${i + 1}° EN CARGAR`,
      label: `${i + 1}° EN CARGAR`,
    })),
  ];

  // Badge color basado en el estado - Paleta de colores variados
  const getStatusBadgeColor = (status: string) => {
    if (status === "CARGADO") {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
    
    // Extraer el número de la posición
    const match = status.match(/^(\d+)° EN CARGAR$/);
    if (!match) return "";
    
    const position = parseInt(match[1]);
    
    // Paleta de colores variados para diferentes posiciones
    const colors = [
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",       // 1°
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", // 2°
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", // 3°
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",   // 4°
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", // 5°
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",   // 6°
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200", // 7°
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",   // 8°
      "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",   // 9°
      "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",   // 10°
    ];
    
    // Si hay más vehículos que colores, ciclar los colores
    return colors[(position - 1) % colors.length];
  };
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
            <div key={row.id} className="grid grid-cols-[90px_140px_200px_auto] gap-1.5 items-center">
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

      {/* Estado de carga */}
      <div className="mt-3">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Estado de Carga
        </label>
        <Select
          value={loadingStatus}
          onValueChange={onUpdateLoadingStatus}
        >
          <SelectTrigger 
            className="h-9 text-xs" 
            data-testid={`select-loading-status-${vehicle.id}`}
          >
            <SelectValue placeholder="Seleccionar estado..." />
          </SelectTrigger>
          <SelectContent>
            {loadingStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className={option.value ? `px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(option.value)}` : ""}>
                  {option.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {loadingStatus && (
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(loadingStatus)}`}>
              {loadingStatus}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
