import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import EmployeeCard from "@/components/EmployeeCard";
import EmployeeDialog from "@/components/EmployeeDialog";
import RolesDialog from "@/components/RolesDialog";
import AvailabilityDialog from "@/components/AvailabilityDialog";
import type { Employee, EmployeeAbsence } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Employees() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  // Fetch employees from API
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  // Fetch available roles from API
  const { data: availableRoles = [] } = useQuery<string[]>({
    queryKey: ['/api/roles'],
  });

  // Query para obtener ausencias del empleado seleccionado
  const { data: absences = [] } = useQuery<EmployeeAbsence[]>({
    queryKey: ['/api/absences', selectedEmployee?.id],
    enabled: !!selectedEmployee?.id && availabilityDialogOpen,
    queryFn: async () => {
      const response = await fetch(`/api/absences?employeeId=${selectedEmployee?.id}`);
      if (!response.ok) throw new Error('Failed to fetch absences');
      return response.json();
    }
  });

  // Mutation para agregar ausencia
  const addAbsenceMutation = useMutation({
    mutationFn: async (data: { employeeId: string; startDate: string; endDate: string; reason: string }) => {
      const response = await fetch('/api/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add absence');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/absences'] });
    },
  });

  // Mutation para eliminar ausencia
  const deleteAbsenceMutation = useMutation({
    mutationFn: async (absenceId: string) => {
      const response = await fetch(`/api/absences/${absenceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete absence');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/absences'] });
    },
  });

  const handleAdd = () => {
    setSelectedEmployee(null);
    setDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleManageAvailability = (employee: Employee) => {
    setSelectedEmployee(employee);
    setAvailabilityDialogOpen(true);
  };

  // Mutation to delete employee
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete employee');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/absences'] });
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    },
  });

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployeeMutation.mutate(employeeToDelete);
    }
  };

  // Mutation to save employee (create or update)
  const saveEmployeeMutation = useMutation({
    mutationFn: async ({ data, id }: { data: { name: string; roles: string[] }, id?: string }) => {
      if (id) {
        const response = await fetch(`/api/employees/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update employee');
        return response.json();
      } else {
        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create employee');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setDialogOpen(false);
    },
  });

  const handleSave = (employeeData: { name: string; roles: string[] }, id?: string) => {
    saveEmployeeMutation.mutate({ data: employeeData, id });
  };

  // Mutation to save roles
  const saveRolesMutation = useMutation({
    mutationFn: async (roles: string[]) => {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles }),
      });
      if (!response.ok) throw new Error('Failed to save roles');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setRolesDialogOpen(false);
    },
  });

  const handleSaveRoles = (roles: string[]) => {
    saveRolesMutation.mutate(roles);
  };

  const handleAddAbsence = (employeeId: string, startDate: string, endDate: string, reason: string) => {
    addAbsenceMutation.mutate({ employeeId, startDate, endDate, reason });
  };

  const handleDeleteAbsence = (absenceId: string) => {
    deleteAbsenceMutation.mutate(absenceId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-employees-title">
                Empleados
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiona el personal y sus funciones
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setRolesDialogOpen(true)} 
                variant="outline" 
                className="gap-2" 
                data-testid="button-manage-roles"
              >
                <Settings className="w-4 h-4" />
                Gestionar Funciones
              </Button>
              <Button onClick={handleAdd} className="gap-2" data-testid="button-add-employee">
                <Plus className="w-4 h-4" />
                Nuevo Empleado
              </Button>
            </div>
          </div>

          {employees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No hay empleados registrados</p>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Agregar Primer Empleado
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onManageAvailability={handleManageAvailability}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={selectedEmployee}
        onSave={handleSave}
        availableRoles={availableRoles}
      />

      <RolesDialog
        open={rolesDialogOpen}
        onOpenChange={setRolesDialogOpen}
        roles={availableRoles}
        onSave={handleSaveRoles}
      />

      {selectedEmployee && (
        <AvailabilityDialog
          open={availabilityDialogOpen}
          onOpenChange={setAvailabilityDialogOpen}
          employee={selectedEmployee}
          absences={absences}
          onAddAbsence={handleAddAbsence}
          onDeleteAbsence={handleDeleteAbsence}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El empleado será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
