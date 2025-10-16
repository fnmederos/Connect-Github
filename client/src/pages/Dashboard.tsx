import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AssignmentCard from "@/components/AssignmentCard";
import type { Vehicle, Employee } from "@shared/schema";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // TODO: remove mock functionality - replace with real data
  const mockEmployees: Employee[] = [
    { id: '1', name: 'Juan Pérez', role: 'Conductor' },
    { id: '2', name: 'María García', role: 'Ayudante' },
    { id: '3', name: 'Carlos López', role: 'Conductor' },
    { id: '4', name: 'Ana Martínez', role: 'Ayudante' },
    { id: '5', name: 'Pedro Sánchez', role: 'Operario' },
  ];

  const mockVehicles: Vehicle[] = [
    { id: '1', name: 'Camión 1', licensePlate: 'ABC-1234' },
    { id: '2', name: 'Camión 2', licensePlate: 'DEF-5678' },
    { id: '3', name: 'Furgoneta 1', licensePlate: 'GHI-9012' },
  ];

  const [assignments, setAssignments] = useState<Record<string, { employees: string[], details: string }>>({});

  const handleAddEmployee = (vehicleId: string, employeeId: string) => {
    setAssignments(prev => ({
      ...prev,
      [vehicleId]: {
        employees: [...(prev[vehicleId]?.employees || []), employeeId],
        details: prev[vehicleId]?.details || '',
      }
    }));
  };

  const handleRemoveEmployee = (vehicleId: string, employeeId: string) => {
    setAssignments(prev => ({
      ...prev,
      [vehicleId]: {
        employees: (prev[vehicleId]?.employees || []).filter(id => id !== employeeId),
        details: prev[vehicleId]?.details || '',
      }
    }));
  };

  const handleDetailsChange = (vehicleId: string, details: string) => {
    setAssignments(prev => ({
      ...prev,
      [vehicleId]: {
        employees: prev[vehicleId]?.employees || [],
        details,
      }
    }));
  };

  const handleSave = () => {
    console.log('Saving assignments for date:', selectedDate);
    console.log('Assignments:', assignments);
    // TODO: remove mock functionality - implement API call
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-dashboard-title">
                Planificación Diaria
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Asigna vehículos y personal para las operaciones del día
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2" data-testid="button-select-date">
                    <CalendarIcon className="w-4 h-4" />
                    {format(selectedDate, "PPP", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={handleSave} className="gap-2" data-testid="button-save-assignments">
                <Save className="w-4 h-4" />
                Guardar Planificación
              </Button>
            </div>
          </div>

          {mockVehicles.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No hay vehículos registrados. Agrega vehículos desde la sección de Vehículos.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mockVehicles.map((vehicle) => {
                const assignment = assignments[vehicle.id] || { employees: [], details: '' };
                const selectedEmployees = mockEmployees.filter(emp => 
                  assignment.employees.includes(emp.id)
                );

                return (
                  <AssignmentCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    selectedEmployees={selectedEmployees}
                    availableEmployees={mockEmployees}
                    details={assignment.details}
                    onAddEmployee={(empId) => handleAddEmployee(vehicle.id, empId)}
                    onRemoveEmployee={(empId) => handleRemoveEmployee(vehicle.id, empId)}
                    onDetailsChange={(details) => handleDetailsChange(vehicle.id, details)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
