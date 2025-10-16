import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, UserPlus, Truck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vehicle, Employee } from "@shared/schema";

interface AssignmentCardProps {
  vehicle: Vehicle;
  selectedEmployees: Employee[];
  availableEmployees: Employee[];
  details: string;
  onAddEmployee: (employeeId: string) => void;
  onRemoveEmployee: (employeeId: string) => void;
  onDetailsChange: (details: string) => void;
}

export default function AssignmentCard({
  vehicle,
  selectedEmployees,
  availableEmployees,
  details,
  onAddEmployee,
  onRemoveEmployee,
  onDetailsChange,
}: AssignmentCardProps) {
  const canAddMore = selectedEmployees.length < 3;
  const availableToSelect = availableEmployees.filter(
    emp => !selectedEmployees.find(sel => sel.id === emp.id)
  );

  return (
    <Card className="p-6" data-testid={`card-assignment-${vehicle.id}`}>
      <div className="space-y-4">
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
          <Badge variant="secondary" className="flex-shrink-0">
            {selectedEmployees.length}/3
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Personal Asignado</p>
          {selectedEmployees.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No hay personal asignado</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedEmployees.map((emp) => (
                <Badge
                  key={emp.id}
                  variant="outline"
                  className="gap-1 pr-1"
                  data-testid={`badge-assigned-employee-${emp.id}`}
                >
                  <span className="truncate max-w-[150px]">{emp.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 hover:bg-transparent"
                    onClick={() => onRemoveEmployee(emp.id)}
                    data-testid={`button-remove-employee-${emp.id}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          
          {canAddMore && availableToSelect.length > 0 && (
            <Select onValueChange={onAddEmployee}>
              <SelectTrigger className="w-full" data-testid={`select-add-employee-${vehicle.id}`}>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <SelectValue placeholder="Agregar personal" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableToSelect.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} - {emp.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Detalles</p>
          <Textarea
            value={details}
            onChange={(e) => onDetailsChange(e.target.value)}
            placeholder="Describe la tarea o detalles de la operación..."
            className="min-h-20 resize-none"
            data-testid={`textarea-details-${vehicle.id}`}
          />
        </div>
      </div>
    </Card>
  );
}
