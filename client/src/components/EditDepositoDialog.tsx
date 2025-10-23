import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import DepositoSection from "@/components/DepositoSection";
import type { DailyAssignment, Employee, DepositoTimeSlot, EmployeeAbsence } from "@shared/schema";

interface EditDepositoDialogProps {
  assignmentId: string;
  onClose: () => void;
}

export default function EditDepositoDialog({
  assignmentId,
  onClose,
}: EditDepositoDialogProps) {
  const { toast } = useToast();

  // Cargar asignación actual (necesitamos una de las asignaciones del mismo día para obtener depositoAssignments)
  const { data: allAssignments = [] } = useQuery<DailyAssignment[]>({
    queryKey: ['/api/daily-assignments'],
  });
  
  const assignment = allAssignments.find(a => a.id === assignmentId);

  // Cargar empleados disponibles
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  // Cargar ausencias
  const { data: absences = [] } = useQuery<EmployeeAbsence[]>({
    queryKey: ['/api/absences'],
  });

  // Estado local para edición
  const [depositoTimeSlots, setDepositoTimeSlots] = useState<DepositoTimeSlot[]>([]);
  const [depositoComments, setDepositoComments] = useState('');

  // Función para verificar si un empleado está disponible en una fecha
  const isEmployeeAvailable = (employeeId: string, dateStr: string): boolean => {
    return !absences.some(absence => {
      const absenceStart = new Date(absence.startDate);
      const absenceEnd = new Date(absence.endDate);
      const checkDate = new Date(dateStr);
      
      return absence.employeeId === employeeId &&
             checkDate >= absenceStart &&
             checkDate <= absenceEnd;
    });
  };

  // Calcular empleados disponibles (sin ausencias en la fecha de la asignación)
  const availableEmployees = useMemo(() => {
    if (!assignment) return employees;
    
    return employees.filter(emp => isEmployeeAvailable(emp.id, assignment.date));
  }, [employees, absences, assignment]);

  // Inicializar estado cuando se carga la asignación
  useEffect(() => {
    if (assignment) {
      try {
        const depotSlots = assignment.depositoAssignments 
          ? JSON.parse(assignment.depositoAssignments) as DepositoTimeSlot[]
          : [];
        setDepositoTimeSlots(depotSlots);
        setDepositoComments(assignment.depositoComments || '');
      } catch (error) {
        console.error('Error parsing deposito data:', error);
      }
    }
  }, [assignment]);

  // Handlers para depósito
  const handleAddDepositoTimeSlot = () => {
    setDepositoTimeSlots(prev => [...prev, {
      id: `deposito-${Date.now()}`,
      timeSlot: '',
      employees: []
    }]);
  };

  const handleRemoveDepositoTimeSlot = (slotId: string) => {
    setDepositoTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
  };

  const handleUpdateDepositoTimeSlot = (slotId: string, timeSlot: string) => {
    setDepositoTimeSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, timeSlot } : slot
    ));
  };

  const handleAddDepositoEmployee = (slotId: string) => {
    setDepositoTimeSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          employees: [...slot.employees, { employeeId: '', employeeName: '', isEncargado: false }]
        };
      }
      return slot;
    }));
  };

  const handleRemoveDepositoEmployee = (slotId: string, employeeIndex: number) => {
    setDepositoTimeSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          employees: slot.employees.filter((_, i) => i !== employeeIndex)
        };
      }
      return slot;
    }));
  };

  const handleUpdateDepositoEmployee = (slotId: string, employeeIndex: number, employeeId: string) => {
    setDepositoTimeSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        const employee = employees.find(e => e.id === employeeId);
        return {
          ...slot,
          employees: slot.employees.map((emp, i) => 
            i === employeeIndex 
              ? { ...emp, employeeId, employeeName: employee?.name || '' }
              : emp
          )
        };
      }
      return slot;
    }));
  };

  const handleToggleDepositoEncargado = (slotId: string, employeeIndex: number) => {
    setDepositoTimeSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          employees: slot.employees.map((emp, i) => {
            if (i === employeeIndex) {
              return { ...emp, isEncargado: !emp.isEncargado };
            }
            // Si estamos activando encargado en este empleado, desactivar otros en el mismo slot
            if (slot.employees[employeeIndex].isEncargado === false) {
              return { ...emp, isEncargado: false };
            }
            return emp;
          })
        };
      }
      return slot;
    }));
  };

  // Calcular empleados ya asignados en depósito (para evitar duplicados)
  const allAssignedEmployeeIds = useMemo(() => {
    const assigned = new Set<string>();
    
    // Empleados asignados en depósito
    depositoTimeSlots.forEach(slot => {
      slot.employees.forEach(emp => {
        if (emp.employeeId) {
          const employee = employees.find(e => e.id === emp.employeeId);
          if (employee && !employee.allowDuplicates) {
            assigned.add(emp.employeeId);
          }
        }
      });
    });
    
    return assigned;
  }, [depositoTimeSlots, employees]);

  // Mutación para guardar cambios
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!assignment) throw new Error("Assignment not found");

      const updatedData = {
        depositoAssignments: JSON.stringify(depositoTimeSlots),
        depositoComments,
      };

      const response = await fetch(`/api/daily-assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update deposito');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-assignments'] });
      toast({
        title: "Depósito actualizado",
        description: "Los cambios se guardaron correctamente.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!assignment) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="title-edit-deposito">
            Editar Personal de Depósito
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <DepositoSection
            timeSlots={depositoTimeSlots}
            availableEmployees={availableEmployees}
            allAssignedEmployeeIds={allAssignedEmployeeIds}
            comments={depositoComments}
            onAddTimeSlot={handleAddDepositoTimeSlot}
            onRemoveTimeSlot={handleRemoveDepositoTimeSlot}
            onUpdateTimeSlot={handleUpdateDepositoTimeSlot}
            onAddEmployee={handleAddDepositoEmployee}
            onRemoveEmployee={handleRemoveDepositoEmployee}
            onUpdateEmployee={handleUpdateDepositoEmployee}
            onToggleEncargado={handleToggleDepositoEncargado}
            onUpdateComments={setDepositoComments}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateMutation.isPending}
            data-testid="button-cancel-edit-deposito"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            data-testid="button-save-edit-deposito"
          >
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
