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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">DEPOSITO</h2>
        <Button
          onClick={onAddTimeSlot}
          size="sm"
          data-testid="button-add-timeslot"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Horario
        </Button>
      </div>

      <div className="space-y-4">
        {timeSlots.map((slot) => (
          <Card key={slot.id} className="p-4" data-testid={`card-timeslot-${slot.id}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={slot.timeSlot}
                  onChange={(e) => onUpdateTimeSlot(slot.id, e.target.value)}
                  placeholder="08:00-12:00"
                  className="flex-1 px-3 py-2 border rounded-md"
                  data-testid={`input-timeslot-${slot.id}`}
                />
                <Button
                  onClick={() => onRemoveTimeSlot(slot.id)}
                  variant="ghost"
                  size="icon"
                  data-testid={`button-remove-timeslot-${slot.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {slot.employees.map((employee, index) => {
                  const selectedEmployee = availableEmployees.find(e => e.id === employee.employeeId);
                  const isEncargado = employee.isEncargado;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded-md ${
                        isEncargado ? 'bg-primary/10 border-2 border-primary' : 'bg-muted'
                      }`}
                      data-testid={`deposito-employee-${slot.id}-${index}`}
                    >
                      {isEncargado && (
                        <span className="font-bold text-primary text-sm px-2">ENCARGADO</span>
                      )}
                      <Select
                        value={employee.employeeId}
                        onValueChange={(value) => onUpdateEmployee(slot.id, index, value)}
                      >
                        <SelectTrigger className="flex-1" data-testid={`select-employee-${slot.id}-${index}`}>
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
                        data-testid={`button-toggle-encargado-${slot.id}-${index}`}
                      >
                        {isEncargado ? "Encargado" : "Hacer Encargado"}
                      </Button>
                      <Button
                        onClick={() => onRemoveEmployee(slot.id, index)}
                        variant="ghost"
                        size="icon"
                        data-testid={`button-remove-employee-${slot.id}-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={() => onAddEmployee(slot.id)}
                variant="outline"
                size="sm"
                data-testid={`button-add-employee-${slot.id}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Empleado
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
