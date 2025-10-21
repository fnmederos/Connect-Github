import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Save, Plus, FileText, FolderOpen, Users, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AssignmentCard from "@/components/AssignmentCard";
import VehicleSelectionDialog from "@/components/VehicleSelectionDialog";
import SaveTemplateDialog from "@/components/SaveTemplateDialog";
import LoadTemplateDialog from "@/components/LoadTemplateDialog";
import DepositoSection from "@/components/DepositoSection";
import AvailableEmployeesPanel from "@/components/AvailableEmployeesPanel";
import PlanningExportView from "@/components/PlanningExportView";
import html2canvas from "html2canvas";
import type { Vehicle, Employee, EmployeeAbsence, Template, DepositoTimeSlot } from "@shared/schema";

interface AssignmentRow {
  id: string;
  role: string;
  employeeId: string;
  time: string;
}

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [vehicleAssignments, setVehicleAssignments] = useState<Record<string, AssignmentRow[]>>({});
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [vehicleComments, setVehicleComments] = useState<Record<string, string>>({});
  const [vehicleLoadingStatus, setVehicleLoadingStatus] = useState<Record<string, string>>({});
  const [depositoTimeSlots, setDepositoTimeSlots] = useState<DepositoTimeSlot[]>([]);
  const [depositoComments, setDepositoComments] = useState<string>("");
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [showLoadTemplateDialog, setShowLoadTemplateDialog] = useState(false);
  const [isAvailablePanelOpen, setIsAvailablePanelOpen] = useState(false);
  const exportViewRef = useRef<HTMLDivElement>(null);
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

  // Query para obtener todas las plantillas
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
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

  // Calcular empleados verdaderamente disponibles (no asignados en vehículos ni depósito)
  // EXCLUIR empleados con allowDuplicates=true para que sigan disponibles
  const unassignedEmployees = useMemo(() => {
    const assignedIds = new Set<string>();
    
    // Recopilar IDs de empleados asignados en vehículos
    Object.values(vehicleAssignments).forEach(rows => {
      rows.forEach(row => {
        if (row.employeeId) {
          const employee = employees.find(e => e.id === row.employeeId);
          // Solo marcar como asignado si NO permite duplicados
          if (employee && !employee.allowDuplicates) {
            assignedIds.add(row.employeeId);
          }
        }
      });
    });
    
    // Recopilar IDs de empleados asignados en depósito
    depositoTimeSlots.forEach(slot => {
      slot.employees.forEach(emp => {
        if (emp.employeeId) {
          const employee = employees.find(e => e.id === emp.employeeId);
          // Solo marcar como asignado si NO permite duplicados
          if (employee && !employee.allowDuplicates) {
            assignedIds.add(emp.employeeId);
          }
        }
      });
    });
    
    // Filtrar empleados disponibles que no están asignados
    return availableEmployees.filter(emp => !assignedIds.has(emp.id));
  }, [availableEmployees, vehicleAssignments, depositoTimeSlots, employees]);

  // Función helper para reconciliar asignaciones con disponibilidad y roles
  const reconcileAssignments = (assignments: Record<string, AssignmentRow[]>, showToast: boolean = true): { 
    updated: Record<string, AssignmentRow[]>, 
    cleanedCount: number 
  } => {
    let cleanedCount = 0;
    const availableEmployeeIds = new Set(availableEmployees.map(e => e.id));
    const updated: Record<string, AssignmentRow[]> = {};
    
    Object.keys(assignments).forEach(vehicleId => {
      updated[vehicleId] = assignments[vehicleId].map(row => {
        if (row.employeeId) {
          const employee = employees.find(e => e.id === row.employeeId);
          const isAvailable = availableEmployeeIds.has(row.employeeId);
          const hasRole = employee?.roles.includes(row.role);
          
          // Limpiar si el empleado no está disponible o no tiene el rol
          if (!isAvailable || !hasRole) {
            cleanedCount++;
            return { ...row, employeeId: '' };
          }
        }
        return row;
      });
    });
    
    if (showToast && cleanedCount > 0) {
      toast({
        title: "Asignaciones actualizadas",
        description: `Se limpiaron ${cleanedCount} asignación(es) de personal no disponible o sin la función requerida.`,
        variant: "default",
      });
    }
    
    return { updated, cleanedCount };
  };

  // Función helper para detectar y limpiar empleados duplicados
  // EXCLUYE empleados con allowDuplicates=true
  const removeDuplicateAssignments = (assignments: Record<string, AssignmentRow[]>): {
    updated: Record<string, AssignmentRow[]>,
    duplicatesRemoved: number
  } => {
    const seenEmployees = new Set<string>();
    let duplicatesRemoved = 0;
    const updated: Record<string, AssignmentRow[]> = {};

    // Procesar en orden de vehículos
    Object.keys(assignments).forEach(vehicleId => {
      updated[vehicleId] = assignments[vehicleId].map(row => {
        if (row.employeeId) {
          const employee = employees.find(e => e.id === row.employeeId);
          
          // Si el empleado permite duplicados, no limpiarlo
          if (employee?.allowDuplicates) {
            return row;
          }
          
          // Si este empleado ya fue asignado antes, limpiar esta asignación
          if (seenEmployees.has(row.employeeId)) {
            duplicatesRemoved++;
            return { ...row, employeeId: '' };
          }
          // Registrar este empleado como ya asignado
          seenEmployees.add(row.employeeId);
        }
        return row;
      });
    });

    return { updated, duplicatesRemoved };
  };

  // Efecto para limpiar asignaciones cuando cambia la disponibilidad y eliminar duplicados
  useEffect(() => {
    setVehicleAssignments(prev => {
      // Primero reconciliar disponibilidad y roles
      const { updated: afterReconcile } = reconcileAssignments(prev, false);
      
      // Luego eliminar duplicados
      const { updated: final, duplicatesRemoved } = removeDuplicateAssignments(afterReconcile);
      
      // Solo mostrar toast si hay cambios
      const hasChanges = JSON.stringify(prev) !== JSON.stringify(final);
      if (hasChanges && duplicatesRemoved > 0) {
        toast({
          title: "Asignaciones actualizadas",
          description: `Se limpiaron duplicados y asignaciones no válidas.`,
          variant: "default",
        });
      }
      
      return hasChanges ? final : prev;
    });
  }, [availableEmployees, employees]);

  // Efecto para limpiar asignaciones de depósito cuando cambia la disponibilidad
  useEffect(() => {
    setDepositoTimeSlots(prev => {
      const availableEmployeeIds = new Set(availableEmployees.map(e => e.id));
      let cleanedCount = 0;
      
      const updated = prev.map(slot => {
        const cleanedEmployees = slot.employees.map(emp => {
          if (emp.employeeId && !availableEmployeeIds.has(emp.employeeId)) {
            cleanedCount++;
            return { ...emp, employeeId: '', employeeName: '' };
          }
          return emp;
        });
        
        return { ...slot, employees: cleanedEmployees };
      });
      
      return cleanedCount > 0 ? updated : prev;
    });
  }, [availableEmployees]);

  // Calcular vehículos seleccionados basado en IDs
  const selectedVehicles = useMemo(() => {
    return selectedVehicleIds
      .map(id => vehicles.find(v => v.id === id))
      .filter((v): v is Vehicle => v !== undefined);
  }, [vehicles, selectedVehicleIds]);

  // Handler para confirmar selección de vehículos
  const handleVehicleSelectionConfirm = (vehicleIds: string[]) => {
    setSelectedVehicleIds(vehicleIds);
    // Reconstruir assignments solo para vehículos seleccionados
    setVehicleAssignments(prev => {
      const updated: Record<string, AssignmentRow[]> = {};
      vehicleIds.forEach(id => {
        // Mantener assignments existentes o inicializar vacío
        updated[id] = prev[id] || [];
      });
      return updated;
    });
    // Reconstruir comentarios solo para vehículos seleccionados
    setVehicleComments(prev => {
      const updated: Record<string, string> = {};
      vehicleIds.forEach(id => {
        // Mantener comentarios existentes o inicializar vacío
        updated[id] = prev[id] || '';
      });
      return updated;
    });
  };

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
      [vehicleId]: (prev[vehicleId] || []).map(a => {
        if (a.id === rowId) {
          // Si hay un empleado asignado, verificar si está disponible y tiene el nuevo rol
          if (a.employeeId && role) {
            const employee = availableEmployees.find(e => e.id === a.employeeId);
            const hasNewRole = employee?.roles.includes(role);
            
            // Si el empleado no está disponible o no tiene el nuevo rol, limpiar la asignación
            if (!employee || !hasNewRole) {
              return { ...a, role, employeeId: '' };
            }
          }
          return { ...a, role };
        }
        return a;
      })
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

  const handleUpdateVehicleComments = (vehicleId: string, comments: string) => {
    setVehicleComments(prev => ({
      ...prev,
      [vehicleId]: comments
    }));
  };

  const handleUpdateVehicleLoadingStatus = (vehicleId: string, status: string) => {
    setVehicleLoadingStatus(prev => ({
      ...prev,
      [vehicleId]: status
    }));
  };

  const handleMoveVehicleUp = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      const index = prev.indexOf(vehicleId);
      if (index <= 0) return prev;
      const newOrder = [...prev];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      return newOrder;
    });
  };

  const handleMoveVehicleDown = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      const index = prev.indexOf(vehicleId);
      if (index < 0 || index >= prev.length - 1) return prev;
      const newOrder = [...prev];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      return newOrder;
    });
  };

  // Handlers para DEPOSITO
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

  // Mutation para guardar asignaciones
  const saveAssignmentsMutation = useMutation({
    mutationFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Primero validar que hay datos para guardar
      if (selectedVehicles.length === 0 && depositoTimeSlots.length === 0) {
        throw new Error('No hay datos para guardar');
      }
      
      // Solo ahora eliminar las asignaciones existentes del día para reemplazarlas
      const deleteResponse = await fetch(`/api/daily-assignments/by-date/${dateStr}`, {
        method: 'DELETE',
      });
      
      if (!deleteResponse.ok) {
        throw new Error('No se pudo eliminar las asignaciones anteriores');
      }
      
      const assignments = [];

      // Si no hay vehículos seleccionados, pero hay DEPOSITO, guardar solo eso
      if (selectedVehicles.length === 0) {
        // Guardar solo DEPOSITO sin vehículos (crear un registro especial)
        const response = await fetch('/api/daily-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: dateStr,
            vehicleId: 'no-vehicle',
            vehicleName: 'Sin Vehículos',
            vehicleLicensePlate: '',
            assignmentRows: JSON.stringify([]),
            comments: '',
            loadingStatus: '',
            depositoAssignments: JSON.stringify(depositoTimeSlots),
            depositoComments: depositoComments
          }),
        });

        if (!response.ok) throw new Error('Failed to save assignment');
        assignments.push(await response.json());
      } else {
        // Hay vehículos seleccionados
        for (const vehicle of selectedVehicles) {
          const rows = vehicleAssignments[vehicle.id] || [];
          
          const validRows = rows.filter(row => row.employeeId && row.role);
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
              assignmentRows: JSON.stringify(assignmentRowsData),
              comments: vehicleComments[vehicle.id] || '',
              loadingStatus: vehicleLoadingStatus[vehicle.id] || '',
              depositoAssignments: JSON.stringify(depositoTimeSlots),
              depositoComments: depositoComments
            }),
          });

          if (!response.ok) throw new Error('Failed to save assignment');
          assignments.push(await response.json());
        }
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

  // Mutación para crear plantilla
  const createTemplateMutation = useMutation({
    mutationFn: async (name: string) => {
      // Preparar los datos de asignación
      const assignmentData: Record<string, any[]> = {};
      selectedVehicleIds.forEach(vehicleId => {
        const rows = vehicleAssignments[vehicleId] || [];
        assignmentData[vehicleId] = rows.map(row => ({
          role: row.role,
          employeeId: row.employeeId,
          time: row.time
        }));
      });

      // Preparar comentarios por vehículo
      const commentsData: Record<string, string> = {};
      selectedVehicleIds.forEach(vehicleId => {
        commentsData[vehicleId] = vehicleComments[vehicleId] || '';
      });

      // Preparar estados de carga por vehículo
      const loadingStatusData: Record<string, string> = {};
      selectedVehicleIds.forEach(vehicleId => {
        loadingStatusData[vehicleId] = vehicleLoadingStatus[vehicleId] || '';
      });

      return await apiRequest('POST', '/api/templates', {
        name,
        vehicleIds: selectedVehicleIds,
        assignmentData: JSON.stringify(assignmentData),
        comments: JSON.stringify(commentsData),
        loadingStatusData: JSON.stringify(loadingStatusData),
        depositoAssignments: JSON.stringify(depositoTimeSlots),
        depositoComments: depositoComments
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Plantilla guardada",
        description: "La plantilla se guardó correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo guardar la plantilla: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar plantilla
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      await apiRequest('DELETE', `/api/templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla se eliminó correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la plantilla: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Función para guardar plantilla
  const handleSaveTemplate = (name: string) => {
    if (selectedVehicleIds.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un vehículo para crear una plantilla.",
        variant: "destructive",
      });
      return;
    }
    createTemplateMutation.mutate(name);
  };

  // Función para cargar plantilla
  const handleLoadTemplate = (template: Template) => {
    setSelectedVehicleIds(template.vehicleIds);
    
    // Parsear los datos de asignación
    const parsedData = JSON.parse(template.assignmentData);
    const newAssignments: Record<string, AssignmentRow[]> = {};
    
    template.vehicleIds.forEach(vehicleId => {
      const templateRows = parsedData[vehicleId] || [];
      newAssignments[vehicleId] = templateRows.map((row: any, index: number) => ({
        id: `${vehicleId}-${Date.now()}-${index}`,
        role: row.role,
        employeeId: row.employeeId,
        time: row.time
      }));
    });
    
    // Reconciliar asignaciones para limpiar empleados no disponibles o sin el rol
    const { updated: afterReconcile } = reconcileAssignments(newAssignments, false);
    
    // Eliminar duplicados
    const { updated: finalAssignments, duplicatesRemoved } = removeDuplicateAssignments(afterReconcile);
    
    setVehicleAssignments(finalAssignments);
    
    // Notificar si se limpiaron duplicados
    if (duplicatesRemoved > 0) {
      toast({
        title: "Plantilla cargada con ajustes",
        description: `Se limpiaron ${duplicatesRemoved} asignación(es) duplicadas al cargar la plantilla.`,
        variant: "default",
      });
    }
    
    // Cargar comentarios por vehículo y DEPOSITO
    try {
      const parsedComments = JSON.parse(template.comments || '{}');
      // Verificar si es un objeto válido (plantilla nueva) o necesita conversión
      if (typeof parsedComments === 'object' && parsedComments !== null && !Array.isArray(parsedComments)) {
        setVehicleComments(parsedComments);
      } else {
        // Caso inesperado: establecer vacío
        setVehicleComments({});
      }
    } catch {
      // Si JSON.parse falla, es un string simple (plantilla antigua)
      // Distribuir el comentario a todos los vehículos de la plantilla
      const legacyComment = template.comments || '';
      const commentsPerVehicle: Record<string, string> = {};
      template.vehicleIds.forEach(vehicleId => {
        commentsPerVehicle[vehicleId] = legacyComment;
      });
      setVehicleComments(commentsPerVehicle);
    }
    
    // Cargar estados de carga por vehículo
    try {
      const parsedLoadingStatus = JSON.parse(template.loadingStatusData || '{}');
      if (typeof parsedLoadingStatus === 'object' && parsedLoadingStatus !== null && !Array.isArray(parsedLoadingStatus)) {
        setVehicleLoadingStatus(parsedLoadingStatus);
      } else {
        setVehicleLoadingStatus({});
      }
    } catch {
      setVehicleLoadingStatus({});
    }
    
    const depositoData = template.depositoAssignments ? JSON.parse(template.depositoAssignments) : [];
    setDepositoTimeSlots(depositoData);
    
    // Cargar comentarios de DEPOSITO
    setDepositoComments(template.depositoComments || '');
    
    toast({
      title: "Plantilla cargada",
      description: `Se cargó la plantilla "${template.name}" correctamente.`,
    });
  };

  // Función para eliminar plantilla
  const handleDeleteTemplate = (templateId: string) => {
    deleteTemplateMutation.mutate(templateId);
  };

  // Función para exportar como imagen
  const handleExportAsImage = async () => {
    if (!exportViewRef.current) return;

    try {
      const canvas = await html2canvas(exportViewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Mayor calidad
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          link.download = `planificacion-${dateStr}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Imagen exportada",
            description: "La planificación se ha descargado correctamente.",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo generar la imagen de la planificación.",
        variant: "destructive",
      });
    }
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
            <div className="flex items-center gap-2 flex-wrap">
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
                onClick={() => setShowVehicleDialog(true)}
                variant="outline"
                className="gap-2" 
                data-testid="button-add-vehicles"
              >
                <Plus className="w-4 h-4" />
                Ingresar Vehículos
                {selectedVehicleIds.length > 0 && (
                  <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                    {selectedVehicleIds.length}
                  </span>
                )}
              </Button>
              <Button 
                onClick={() => setShowLoadTemplateDialog(true)}
                variant="outline"
                className="gap-2" 
                data-testid="button-load-template"
              >
                <FolderOpen className="w-4 h-4" />
                Cargar Plantilla
              </Button>
              <Button 
                onClick={handleExportAsImage}
                variant="outline"
                className="gap-2" 
                data-testid="button-export-image"
                disabled={selectedVehicleIds.length === 0 && depositoTimeSlots.length === 0}
              >
                <Download className="w-4 h-4" />
                Exportar como Imagen
              </Button>
              <Button 
                onClick={() => setShowSaveTemplateDialog(true)}
                variant="outline"
                className="gap-2" 
                data-testid="button-save-template"
                disabled={selectedVehicleIds.length === 0}
              >
                <FileText className="w-4 h-4" />
                Guardar como Plantilla
              </Button>
              <Button 
                onClick={handleSave} 
                className="gap-2" 
                data-testid="button-save-assignments"
                disabled={saveAssignmentsMutation.isPending || selectedVehicleIds.length === 0}
              >
                <Save className="w-4 h-4" />
                {saveAssignmentsMutation.isPending ? 'Guardando...' : 'Guardar Planificación'}
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Columna principal - Planificación */}
            <div className="flex-1 space-y-6 min-w-0">
              {(() => {
                // Calcular TODOS los empleados ya asignados (vehículos + depósito)
                // EXCLUIR empleados con allowDuplicates=true
                const allAssignedEmployeeIds = new Set<string>();
                
                // Empleados asignados en vehículos
                Object.values(vehicleAssignments).forEach(rows => {
                  rows.forEach(row => {
                    if (row.employeeId) {
                      const employee = employees.find(e => e.id === row.employeeId);
                      // Solo agregar si el empleado NO permite duplicados
                      if (employee && !employee.allowDuplicates) {
                        allAssignedEmployeeIds.add(row.employeeId);
                      }
                    }
                  });
                });
                
                // Empleados asignados en depósito
                depositoTimeSlots.forEach(slot => {
                  slot.employees.forEach(emp => {
                    if (emp.employeeId) {
                      const employee = employees.find(e => e.id === emp.employeeId);
                      // Solo agregar si el empleado NO permite duplicados
                      if (employee && !employee.allowDuplicates) {
                        allAssignedEmployeeIds.add(emp.employeeId);
                      }
                    }
                  });
                });
                
                return (
                  <>
                    {selectedVehicleIds.length === 0 ? (
                      <Card className="p-8 text-center">
                        <p className="text-muted-foreground">
                          No hay vehículos seleccionados. Haz clic en "Ingresar Vehículos" para comenzar.
                        </p>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {selectedVehicles.map((vehicle, index) => (
                          <AssignmentCard
                            key={vehicle.id}
                            vehicle={vehicle}
                            availableEmployees={availableEmployees}
                            availableRoles={availableRoles}
                            assignments={vehicleAssignments[vehicle.id] || []}
                            comments={vehicleComments[vehicle.id] || ''}
                            loadingStatus={vehicleLoadingStatus[vehicle.id] || ''}
                            allAssignedEmployeeIds={allAssignedEmployeeIds}
                            totalVehicles={selectedVehicles.length}
                            canMoveUp={index > 0}
                            canMoveDown={index < selectedVehicles.length - 1}
                            onAddRow={() => handleAddRow(vehicle.id)}
                            onRemoveRow={(rowId) => handleRemoveRow(vehicle.id, rowId)}
                            onUpdateRole={(rowId, role) => handleUpdateRole(vehicle.id, rowId, role)}
                            onUpdateEmployee={(rowId, empId) => handleUpdateEmployee(vehicle.id, rowId, empId)}
                            onUpdateTime={(rowId, time) => handleUpdateTime(vehicle.id, rowId, time)}
                            onUpdateComments={(comments) => handleUpdateVehicleComments(vehicle.id, comments)}
                            onUpdateLoadingStatus={(status) => handleUpdateVehicleLoadingStatus(vehicle.id, status)}
                            onMoveUp={() => handleMoveVehicleUp(vehicle.id)}
                            onMoveDown={() => handleMoveVehicleDown(vehicle.id)}
                          />
                        ))}
                      </div>
                    )}

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
                  </>
                );
              })()}
            </div>

            {/* Columna lateral - Personal disponible */}
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => setIsAvailablePanelOpen(!isAvailablePanelOpen)}
                variant={isAvailablePanelOpen ? "default" : "outline"}
                className="gap-2 w-full" 
                data-testid="button-toggle-available-panel"
              >
                <Users className="w-4 h-4" />
                Personal
                <span className="ml-1 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                  {unassignedEmployees.length}
                </span>
              </Button>
              
              <AvailableEmployeesPanel
                isOpen={isAvailablePanelOpen}
                availableEmployees={unassignedEmployees}
                allRoles={availableRoles}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Componente oculto para exportación como imagen */}
      <div 
        ref={exportViewRef} 
        className="absolute -left-[9999px] -top-[9999px]"
        style={{ position: 'absolute' }}
      >
        <PlanningExportView
          date={selectedDate}
          vehicles={selectedVehicles}
          vehicleAssignments={vehicleAssignments}
          vehicleComments={vehicleComments}
          vehicleLoadingStatus={vehicleLoadingStatus}
          depositoTimeSlots={depositoTimeSlots}
          depositoComments={depositoComments}
          employees={employees}
        />
      </div>

      <VehicleSelectionDialog
        open={showVehicleDialog}
        onOpenChange={setShowVehicleDialog}
        vehicles={vehicles}
        selectedVehicleIds={selectedVehicleIds}
        onConfirm={handleVehicleSelectionConfirm}
      />

      <SaveTemplateDialog
        open={showSaveTemplateDialog}
        onOpenChange={setShowSaveTemplateDialog}
        onSave={handleSaveTemplate}
      />

      <LoadTemplateDialog
        open={showLoadTemplateDialog}
        onOpenChange={setShowLoadTemplateDialog}
        templates={templates}
        onLoad={handleLoadTemplate}
        onDelete={handleDeleteTemplate}
      />
    </div>
  );
}
