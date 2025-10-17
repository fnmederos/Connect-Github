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
    <div className="border-4 border-red-500 rounded-lg p-4 bg-red-500/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-red-600">DEPOSITO</h2>
        <Button
          onClick={onAddTimeSlot}
          size="sm"
          className="h-8 text-xs bg-red-500 hover:bg-red-600 text-white"
          data-testid="button-add-timeslot"
        >
          <Plus className="w-3 h-3 mr-1" />
          Agregar Horario
        </Button>
      </div>

      {/* Time Slots - Cajas verdes */}
      <div className="space-y-3">
        {timeSlots.map((slot) => (
          <div
            key={slot.id}
            className="border-3 border-green-600 bg-green-500/10 rounded-md p-3"
            data-testid={`card-timeslot-${slot.id}`}
          >
            {/* Time slot header */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={slot.timeSlot}
                onChange={(e) => onUpdateTimeSlot(slot.id, e.target.value)}
                placeholder="08:00-12:00"
                className="flex-1 px-2 py-1 border-2 border-green-600 bg-white rounded-md text-sm font-medium"
                data-testid={`input-timeslot-${slot.id}`}
              />
              <Button
                onClick={() => onRemoveTimeSlot(slot.id)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-red-500/20"
                data-testid={`button-remove-timeslot-${slot.id}`}
              >
                <X className="w-4 h-4 text-red-600" />
              </Button>
            </div>

            {/* Employees inside green box */}
            <div className="space-y-1.5">
              {slot.employees.map((employee, index) => {
                const isEncargado = employee.isEncargado;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded border-2 ${
                      isEncargado 
                        ? 'bg-yellow-400/20 border-yellow-600' 
                        : 'bg-orange-500/10 border-orange-500'
                    }`}
                    data-testid={`deposito-employee-${slot.id}-${index}`}
                  >
                    {isEncargado && (
                      <span className="font-bold text-yellow-700 text-xs px-1.5 bg-yellow-400/40 rounded">
                        ENCARGADO
                      </span>
                    )}
                    <Select
                      value={employee.employeeId}
                      onValueChange={(value) => onUpdateEmployee(slot.id, index, value)}
                    >
                      <SelectTrigger className="flex-1 h-7 text-xs border-transparent bg-transparent" data-testid={`select-employee-${slot.id}-${index}`}>
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
                      className="h-6 text-xs px-2"
                      data-testid={`button-toggle-encargado-${slot.id}-${index}`}
                    >
                      {isEncargado ? "✓" : "E"}
                    </Button>
                    <Button
                      onClick={() => onRemoveEmployee(slot.id, index)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      data-testid={`button-remove-employee-${slot.id}-${index}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Add employee button */}
            <Button
              onClick={() => onAddEmployee(slot.id)}
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs border-green-600 hover:bg-green-500/20"
              data-testid={`button-add-employee-${slot.id}`}
            >
              <Plus className="w-3 h-3 mr-1" />
              Agregar Empleado
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
