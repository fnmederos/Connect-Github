import { useState, useEffect } from "react";
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
import type { DailyAssignment, Employee, AssignmentRowData } from "@shared/schema";

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

  // Estado local para edición
  const [assignmentRows, setAssignmentRows] = useState<AssignmentRowData[]>([]);
  const [comments, setComments] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('');

  // Inicializar estado cuando se carga la asignación
  useEffect(() => {
    if (assignment) {
      try {
        const rows = JSON.parse(assignment.assignmentRows) as AssignmentRowData[];
        setAssignmentRows(rows);
        setComments(assignment.comments || '');
        setLoadingStatus(assignment.loadingStatus || '');
      } catch (error) {
        console.error('Error parsing assignment data:', error);
      }
    }
  }, [assignment]);

  // Opciones de estado de carga
  const loadingStatusOptions = [
    { value: "", label: "Sin asignar" },
    { value: "CARGADO", label: "CARGADO" },
    ...Array.from({ length: 15 }, (_, i) => ({
      value: `${i + 1}° EN CARGAR`,
      label: `${i + 1}° EN CARGAR`,
    })),
  ];

  // Mutación para guardar cambios
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!assignment) throw new Error("Assignment not found");

      const updatedData = {
        assignmentRows: JSON.stringify(assignmentRows),
        comments,
        loadingStatus,
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
            <Select value={loadingStatus} onValueChange={setLoadingStatus}>
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
              {assignmentRows.map((row, index) => (
                <div key={index} className="flex gap-2 items-start p-2 border rounded-md">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Select
                      value={row.employeeId}
                      onValueChange={(value) => handleUpdateRow(index, 'employeeId', value)}
                    >
                      <SelectTrigger data-testid={`select-employee-${index}`}>
                        <SelectValue placeholder="Empleado" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={row.role}
                      onValueChange={(value) => handleUpdateRow(index, 'role', value)}
                    >
                      <SelectTrigger data-testid={`select-role-${index}`}>
                        <SelectValue placeholder="Rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Horario (ej: 08:00)"
                      value={row.time}
                      onChange={(e) => handleUpdateRow(index, 'time', e.target.value)}
                      data-testid={`input-time-${index}`}
                    />
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
              ))}

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
