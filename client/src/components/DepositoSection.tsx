import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type { Employee, DepositoTimeSlot, DepositoEmployeeData } from "@shared/schema";

interface DepositoSectionProps {
  timeSlots: DepositoTimeSlot[];
  availableEmployees: Employee[];
  onAddTimeSlot: () => void;
  onRemoveTimeSlot: (slotId: string) => void;
  onUpdateTimeSlot: (slotId: string, timeSlot: string) => void;
  onAddEmployee: (slotId: string) => void;
  onRemoveEmployee: (slotId: string, employeeIndex: number) => void;
  onUpdateEmployee: (slotId: string, employeeIndex: number, employeeId: string) => void;
  onToggleEncargado: (slotId: string, employeeIndex: number) => void;
}

export default function DepositoSection({
  timeSlots,
  availableEmployees,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onUpdateTimeSlot,
  onAddEmployee,
  onRemoveEmployee,
  onUpdateEmployee,
  onToggleEncargado,
}: DepositoSectionProps) {
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
            className="grid grid-cols-[180px_1fr] gap-3 items-start border-b pb-2 last:border-b-0"
            data-testid={`card-timeslot-${slot.id}`}
          >
            {/* Columna izquierda: Horario */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={slot.timeSlot}
                onChange={(e) => onUpdateTimeSlot(slot.id, e.target.value)}
                placeholder="08:00-12:00"
                className="flex-1 px-2 py-1 border rounded-md text-sm"
                data-testid={`input-timeslot-${slot.id}`}
              />
              <Button
                onClick={() => onRemoveTimeSlot(slot.id)}
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                data-testid={`button-remove-timeslot-${slot.id}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Columna derecha: Empleados nivelados */}
            <div className="space-y-1.5">
              {slot.employees.map((employee, index) => {
                const isEncargado = employee.isEncargado;
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                    data-testid={`deposito-employee-${slot.id}-${index}`}
                  >
                    {isEncargado && (
                      <span className="font-bold text-xs px-1.5 py-0.5 bg-primary/10 border border-primary rounded text-primary">
                        ENCARGADO
                      </span>
                    )}
                    <Select
                      value={employee.employeeId}
                      onValueChange={(value) => onUpdateEmployee(slot.id, index, value)}
                    >
                      <SelectTrigger className="flex-1 h-8 text-xs" data-testid={`select-employee-${slot.id}-${index}`}>
                        <SelectValue placeholder="Seleccionar empleado" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEmployees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
    </Card>
  );
}
