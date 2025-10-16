import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AssignmentCard from "@/components/AssignmentCard";
import type { Vehicle, Employee, EmployeeAbsence } from "@shared/schema";

interface AssignmentRow {
  id: string;
  role: string;
  employeeId: string;
  time: string;
}

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [vehicleAssignments, setVehicleAssignments] = useState<Record<string, AssignmentRow[]>>({});
  const { toast } = useToast();

  // Fetch employees from API
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  // Fetch vehicles from API
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  // Fetch roles from API
  const { data: availableRoles = [] } = useQuery<string[]>({
    queryKey: ['/api/roles'],
  });

  // Query para obtener todas las ausencias
  const { data: allAbsences = [] } = useQuery<EmployeeAbsence[]>({
    queryKey: ['/api/absences'],
    queryFn: async () => {
      const response = await fetch('/api/absences');
      if (!response.ok) throw new Error('Failed to fetch absences');
      return response.json();
    }
  });

  // Función para verificar si un empleado está disponible en una fecha
  const isEmployeeAvailable = (employeeId: string, date: Date): boolean => {
    const dateStr = date.toISOString();
    return !allAbsences.some(absence => {
      const absenceStart = new Date(absence.startDate);
      const absenceEnd = new Date(absence.endDate);
      const checkDate = new Date(dateStr);
      
      return absence.employeeId === employeeId &&
             checkDate >= absenceStart &&
             checkDate <= absenceEnd;
    });
  };

  // Filtrar empleados disponibles según la fecha seleccionada
  const availableEmployees = useMemo(() => {
    return employees.filter(emp => isEmployeeAvailable(emp.id, selectedDate));
  }, [employees, selectedDate, allAbsences]);

  // Inicializar con 2 filas por defecto para cada vehículo
  useEffect(() => {
    if (vehicles.length > 0) {
      const initialAssignments: Record<string, AssignmentRow[]> = {};
      vehicles.forEach((vehicle) => {
        initialAssignments[vehicle.id] = [
          {
            id: `${vehicle.id}-1`,
            role: '',
            employeeId: '',
            time: '08:00',
          },
          {
            id: `${vehicle.id}-2`,
            role: '',
            employeeId: '',
            time: '08:00',
          },
        ];
      });
      setVehicleAssignments(initialAssignments);
    }
  }, [vehicles]);

  const handleAddRow = (vehicleId: string) => {
    setVehicleAssignments(prev => ({
      ...prev,
      [vehicleId]: [
        ...(prev[vehicleId] || []),
        {
          id: `${vehicleId}-${Date.now()}`,
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

  // Mutation para guardar asignaciones
  const saveAssignmentsMutation = useMutation({
    mutationFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const assignments = [];

      for (const vehicle of vehicles) {
        const rows = vehicleAssignments[vehicle.id] || [];
        
        // Solo guardar si hay al menos una asignación completa
        const validRows = rows.filter(row => row.employeeId && row.role);
        if (validRows.length === 0) continue;

        const assignmentRowsData = validRows.map(row => {
          const employee = employees.find(e => e.id === row.employeeId);
          return {
            employeeId: row.employeeId,
            employeeName: employee?.name || '',
            role: row.role,
            time: row.time
          };
        });

        const response = await fetch('/api/daily-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: dateStr,
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            vehicleLicensePlate: vehicle.licensePlate,
            assignmentRows: JSON.stringify(assignmentRowsData)
          }),
        });

        if (!response.ok) throw new Error('Failed to save assignment');
        assignments.push(await response.json());
      }

      return assignments;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-assignments'] });
      toast({
        title: "Planificación guardada",
        description: `La planificación para ${format(selectedDate, "PPP", { locale: es })} se guardó correctamente.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo guardar la planificación: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveAssignmentsMutation.mutate();
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
              <Button 
                onClick={handleSave} 
                className="gap-2" 
                data-testid="button-save-assignments"
                disabled={saveAssignmentsMutation.isPending}
              >
                <Save className="w-4 h-4" />
                {saveAssignmentsMutation.isPending ? 'Guardando...' : 'Guardar Planificación'}
              </Button>
            </div>
          </div>

          {vehicles.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No hay vehículos registrados. Agrega vehículos desde la sección de Vehículos.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <AssignmentCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  availableEmployees={availableEmployees}
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
