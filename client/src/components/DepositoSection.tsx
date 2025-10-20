import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type { Employee, DepositoTimeSlot, DepositoEmployeeData } from "@shared/schema";
import { useRef } from "react";

interface DepositoSectionProps {
  timeSlots: DepositoTimeSlot[];
  availableEmployees: Employee[];
  allAssignedEmployeeIds: Set<string>;
  comments: string;
  onAddTimeSlot: () => void;
  onRemoveTimeSlot: (slotId: string) => void;
  onUpdateTimeSlot: (slotId: string, timeSlot: string) => void;
  onAddEmployee: (slotId: string) => void;
  onRemoveEmployee: (slotId: string, employeeIndex: number) => void;
  onUpdateEmployee: (slotId: string, employeeIndex: number, employeeId: string) => void;
  onToggleEncargado: (slotId: string, employeeIndex: number) => void;
  onUpdateComments: (comments: string) => void;
}

export default function DepositoSection({
  timeSlots,
  availableEmployees,
  allAssignedEmployeeIds,
  comments,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onUpdateTimeSlot,
  onAddEmployee,
  onRemoveEmployee,
  onUpdateEmployee,
  onToggleEncargado,
  onUpdateComments,
}: DepositoSectionProps) {
  // Ref para almacenar los valores anteriores de cada slot
  const previousValuesRef = useRef<Record<string, string>>({});
  
  // Función para formatear automáticamente la hora (HH:MM)
  const handleTimeInput = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const previousValue = previousValuesRef.current[slotId] || '';
    
    // Limpiar: solo permitir números y ":"
    value = value.replace(/[^\d:]/g, '');
    
    // Extraer números
    const numbers = value.replace(/\D/g, '');
    const previousNumbers = previousValue.replace(/\D/g, '');
    
    // Detectar si está escribiendo o borrando basándose en la cantidad de dígitos
    const isTypingForward = numbers.length > previousNumbers.length;
    
    // Formatear automáticamente según la cantidad de números
    let formatted = '';
    
    if (numbers.length === 0) {
      formatted = '';
    } else if (numbers.length === 1) {
      formatted = numbers;
    } else if (numbers.length === 2) {
      // Solo agregar ":" si está escribiendo hacia adelante
      formatted = isTypingForward ? numbers + ':' : numbers;
    } else if (numbers.length === 3) {
      // Formatear como HH:M
      formatted = numbers.slice(0, 2) + ':' + numbers.slice(2, 3);
    } else {
      // Formatear como HH:MM (máximo 4 dígitos)
      formatted = numbers.slice(0, 2) + ':' + numbers.slice(2, 4);
    }
    
    // Guardar el valor formateado para la próxima comparación
    previousValuesRef.current[slotId] = formatted;
    
    onUpdateTimeSlot(slotId, formatted);
  };

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">DEPOSITO</h2>
        <Button
          onClick={onAddTimeSlot}
          size="sm"
          className="h-8 text-xs"
          data-testid="button-add-timeslot"
        >
          <Plus className="w-3 h-3 mr-1" />
          Agregar Horario
        </Button>
      </div>

      {/* Time Slots - Layout horizontal */}
      <div className="space-y-2">
        {timeSlots.map((slot) => (
          <div
            key={slot.id}
            className="grid grid-cols-[110px_1fr] gap-3 items-start border-b pb-2 last:border-b-0"
            data-testid={`card-timeslot-${slot.id}`}
          >
            {/* Columna izquierda: Horario */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={slot.timeSlot}
                onChange={(e) => handleTimeInput(slot.id, e)}
                placeholder="08:00"
                className="w-16 px-2 py-1 border rounded-md text-sm bg-background text-foreground"
                data-testid={`input-timeslot-${slot.id}`}
              />
              <Button
                onClick={() => onRemoveTimeSlot(slot.id)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                data-testid={`button-remove-timeslot-${slot.id}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Columna derecha: Empleados nivelados */}
            <div className="space-y-1.5">
              {slot.employees.map((employee, index) => {
                const isEncargado = employee.isEncargado;
                
                // Filtrar empleados disponibles: excluir los ya asignados, excepto el actual
                const filteredEmployees = availableEmployees.filter(emp => 
                  !allAssignedEmployeeIds.has(emp.id) || emp.id === employee.employeeId
                );
                
                // Obtener el nombre del empleado
                const selectedEmployee = availableEmployees.find(emp => emp.id === employee.employeeId);
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                    data-testid={`deposito-employee-${slot.id}-${index}`}
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <Select
                        value={employee.employeeId}
                        onValueChange={(value) => onUpdateEmployee(slot.id, index, value)}
                      >
                        <SelectTrigger 
                          className={`flex-1 h-8 text-xs ${isEncargado ? 'bg-blue-50 border-blue-300 text-gray-900 dark:text-gray-900' : ''}`} 
                          data-testid={`select-employee-${slot.id}-${index}`}
                        >
                          <SelectValue placeholder="Seleccionar empleado" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredEmployees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isEncargado && selectedEmployee && (
                        <span className="text-blue-600 font-semibold text-xs whitespace-nowrap">
                          ENCARGADO
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => onToggleEncargado(slot.id, index)}
                      variant={isEncargado ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs px-2"
                      data-testid={`button-toggle-encargado-${slot.id}-${index}`}
                    >
                      {isEncargado ? "✓" : "E"}
                    </Button>
                    <Button
                      onClick={() => onRemoveEmployee(slot.id, index)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      data-testid={`button-remove-employee-${slot.id}-${index}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}

              {/* Add employee button */}
              <Button
                onClick={() => onAddEmployee(slot.id)}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                data-testid={`button-add-employee-${slot.id}`}
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar Empleado
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Comments section */}
      <div className="mt-4">
        <textarea
          value={comments}
          onChange={(e) => onUpdateComments(e.target.value)}
          placeholder="Comentarios del depósito..."
          className="w-full px-3 py-2 border rounded-md text-sm bg-background text-foreground min-h-[80px] resize-y"
          data-testid="textarea-deposito-comments"
        />
      </div>
    </Card>
  );
}
