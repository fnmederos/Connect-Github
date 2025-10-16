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

interface AssignmentRow {
  id: string;
  role: string;
  employeeId: string;
  time: string;
}

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

  // TODO: remove mock functionality - make these editable by user
  const availableRoles = ['CHOFER', 'PEON', 'AYUDANTE', 'OPERARIO', 'SUPERVISOR'];

  const [vehicleAssignments, setVehicleAssignments] = useState<Record<string, AssignmentRow[]>>({});

  const handleAddRow = (vehicleId: string) => {
    setVehicleAssignments(prev => ({
      ...prev,
      [vehicleId]: [
        ...(prev[vehicleId] || []),
        {
          id: String(Date.now()),
          role: '',
          employeeId: '',
          time: '08:00',
        }
      ]
    }));
  };

  const handleRemoveRow = (vehicleId: string, rowId: string) => {
    setVehicleAssignments(prev => ({
      ...prev,
      [vehicleId]: (prev[vehicleId] || []).filter(a => a.id !== rowId)
    }));
  };

  const handleUpdateRole = (vehicleId: string, rowId: string, role: string) => {
    setVehicleAssignments(prev => ({
      ...prev,
      [vehicleId]: (prev[vehicleId] || []).map(a => a.id === rowId ? { ...a, role } : a)
    }));
  };

  const handleUpdateEmployee = (vehicleId: string, rowId: string, employeeId: string) => {
    setVehicleAssignments(prev => ({
      ...prev,
      [vehicleId]: (prev[vehicleId] || []).map(a => a.id === rowId ? { ...a, employeeId } : a)
    }));
  };

  const handleUpdateTime = (vehicleId: string, rowId: string, time: string) => {
    setVehicleAssignments(prev => ({
      ...prev,
      [vehicleId]: (prev[vehicleId] || []).map(a => a.id === rowId ? { ...a, time } : a)
    }));
  };

  const handleSave = () => {
    console.log('Saving assignments for date:', selectedDate);
    console.log('Assignments:', vehicleAssignments);
    // TODO: remove mock functionality - implement API call
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="space-y-4">
              {mockVehicles.map((vehicle) => (
                <AssignmentCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  availableEmployees={mockEmployees}
                  availableRoles={availableRoles}
                  assignments={vehicleAssignments[vehicle.id] || []}
                  onAddRow={() => handleAddRow(vehicle.id)}
                  onRemoveRow={(rowId) => handleRemoveRow(vehicle.id, rowId)}
                  onUpdateRole={(rowId, role) => handleUpdateRole(vehicle.id, rowId, role)}
                  onUpdateEmployee={(rowId, empId) => handleUpdateEmployee(vehicle.id, rowId, empId)}
                  onUpdateTime={(rowId, time) => handleUpdateTime(vehicle.id, rowId, time)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
