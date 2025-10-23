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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import DepositoSection from "@/components/DepositoSection";
import type { DailyAssignment, Employee, AssignmentRowData, DepositoTimeSlot, EmployeeAbsence } from "@shared/schema";

interface EditAssignmentDialogProps {
  assignmentId: string;
  onClose: () => void;
}

export default function EditAssignmentDialog({
  assignmentId,
  onClose,
}: EditAssignmentDialogProps) {
  const { toast } = useToast();

  // Cargar asignación actual
  const { data: allAssignments = [] } = useQuery<DailyAssignment[]>({
    queryKey: ['/api/daily-assignments'],
  });
  
  const assignment = allAssignments.find(a => a.id === assignmentId);

  // Cargar empleados disponibles
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  // Cargar roles disponibles
  const { data: roles = [] } = useQuery<string[]>({
    queryKey: ['/api/roles'],
  });

  // Cargar ausencias
  const { data: absences = [] } = useQuery<EmployeeAbsence[]>({
    queryKey: ['/api/absences'],
  });

  // Estado local para edición
  const [assignmentRows, setAssignmentRows] = useState<AssignmentRowData[]>([]);
  const [comments, setComments] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('');
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
        const rows = JSON.parse(assignment.assignmentRows) as AssignmentRowData[];
        setAssignmentRows(rows);
        setComments(assignment.comments || '');
        setLoadingStatus(assignment.loadingStatus || '');
        
        // Cargar datos de depósito
        const depotSlots = assignment.depositoAssignments 
          ? JSON.parse(assignment.depositoAssignments) as DepositoTimeSlot[]
          : [];
        setDepositoTimeSlots(depotSlots);
        setDepositoComments(assignment.depositoComments || '');
      } catch (error) {
        console.error('Error parsing assignment data:', error);
      }
    }
  }, [assignment]);

  // Opciones de estado de carga
  const loadingStatusOptions = [
    { value: "CARGADO", label: "CARGADO" },
    ...Array.from({ length: 15 }, (_, i) => ({
      value: `${i + 1}° EN CARGAR`,
      label: `${i + 1}° EN CARGAR`,
    })),
  ];

  // Validar antes de guardar
  const validateAssignmentRows = (): string | null => {
    for (let i = 0; i < assignmentRows.length; i++) {
      const row = assignmentRows[i];
      if (!row.employeeId || !row.employeeName) {
        return `La fila ${i + 1} debe tener un empleado asignado`;
      }
      if (!row.role) {
        return `La fila ${i + 1} debe tener un rol asignado`;
      }
      if (!row.time || row.time.trim() === '') {
        return `La fila ${i + 1} debe tener un horario asignado`;
      }
    }
    return null;
  };

  // Mutación para guardar cambios
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!assignment) throw new Error("Assignment not found");

      // Validar antes de enviar
      const validationError = validateAssignmentRows();
      if (validationError) {
        throw new Error(validationError);
      }

      const updatedData = {
        assignmentRows: JSON.stringify(assignmentRows),
        comments,
        loadingStatus,
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
        throw new Error(error || 'Failed to update assignment');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-assignments'] });
      toast({
        title: "Asignación actualizada",
        description: "Los cambios se guardaron correctamente.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddRow = () => {
    const newRow: AssignmentRowData = {
      employeeId: '',
      employeeName: '',
      role: '',
      time: '',
    };
    setAssignmentRows([...assignmentRows, newRow]);
  };

  const handleRemoveRow = (index: number) => {
    setAssignmentRows(assignmentRows.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof AssignmentRowData, value: string) => {
    const updated = [...assignmentRows];
    
    if (field === 'employeeId') {
      // También actualizar el nombre del empleado
      const employee = employees.find(e => e.id === value);
      updated[index] = {
        ...updated[index],
        employeeId: value,
        employeeName: employee?.name || '',
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    
    setAssignmentRows(updated);
  };

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

  // Calcular empleados ya asignados (para evitar duplicados)
  const allAssignedEmployeeIds = useMemo(() => {
    const assigned = new Set<string>();
    
    // Empleados asignados en el vehículo
    assignmentRows.forEach(row => {
      if (row.employeeId) {
        const employee = employees.find(e => e.id === row.employeeId);
        if (employee && !employee.allowDuplicates) {
          assigned.add(row.employeeId);
        }
      }
    });
    
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
  }, [assignmentRows, depositoTimeSlots, employees]);

  if (!assignment) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Asignación - {assignment.vehicleName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Patente: {assignment.vehicleLicensePlate}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estado de carga */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Estado de Carga
            </label>
            <Select value={loadingStatus || undefined} onValueChange={setLoadingStatus}>
              <SelectTrigger data-testid="select-loading-status">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {loadingStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asignaciones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Asignaciones</label>
              <Button
                onClick={handleAddRow}
                size="sm"
                variant="outline"
                data-testid="button-add-row"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Línea
              </Button>
            </div>

            <div className="space-y-2">
              {assignmentRows.map((row, index) => {
                const hasEmployeeError = !row.employeeId || !row.employeeName;
                const hasRoleError = !row.role;
                const hasTimeError = !row.time || row.time.trim() === '';
                const hasError = hasEmployeeError || hasRoleError || hasTimeError;
                
                return (
                  <div key={index} className={`flex gap-2 items-start p-2 border rounded-md ${hasError ? 'border-destructive' : ''}`}>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <Select
                          value={row.employeeId || undefined}
                          onValueChange={(value) => handleUpdateRow(index, 'employeeId', value)}
                        >
                          <SelectTrigger 
                            data-testid={`select-employee-${index}`}
                            className={hasEmployeeError ? 'border-destructive' : ''}
                          >
                            <SelectValue placeholder="Empleado *" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.filter(emp => emp.id && emp.id.trim() !== '').map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select
                          value={row.role || undefined}
                          onValueChange={(value) => handleUpdateRow(index, 'role', value)}
                        >
                          <SelectTrigger 
                            data-testid={`select-role-${index}`}
                            className={hasRoleError ? 'border-destructive' : ''}
                          >
                            <SelectValue placeholder="Rol *" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.filter(role => role && role.trim() !== '').map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Input
                          placeholder="Horario (ej: 08:00) *"
                          value={row.time}
                          onChange={(e) => handleUpdateRow(index, 'time', e.target.value)}
                          data-testid={`input-time-${index}`}
                          className={hasTimeError ? 'border-destructive' : ''}
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleRemoveRow(index)}
                      size="icon"
                      variant="ghost"
                      className="flex-shrink-0"
                      data-testid={`button-remove-row-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              {assignmentRows.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay asignaciones. Haz clic en "Agregar Línea" para comenzar.
                </p>
              )}
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Comentarios
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Notas adicionales sobre esta asignación..."
              rows={3}
              data-testid="textarea-comments"
            />
          </div>

          {/* Sección de Depósito */}
          <div>
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateMutation.isPending}
            data-testid="button-cancel-edit"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            data-testid="button-save-edit"
          >
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
