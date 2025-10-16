import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import EmployeeCard from "@/components/EmployeeCard";
import EmployeeDialog from "@/components/EmployeeDialog";
import type { Employee } from "@shared/schema";
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
  // TODO: remove mock functionality - replace with real data
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'Juan Pérez', role: 'Conductor' },
    { id: '2', name: 'María García', role: 'Ayudante' },
    { id: '3', name: 'Carlos López', role: 'Conductor' },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

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

  const confirmDelete = () => {
    if (employeeToDelete) {
      // TODO: remove mock functionality - implement API call
      setEmployees(employees.filter(e => e.id !== employeeToDelete));
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleSave = (employeeData: { name: string; role: string }, id?: string) => {
    // TODO: remove mock functionality - implement API call
    if (id) {
      setEmployees(employees.map(e => e.id === id ? { ...e, ...employeeData } : e));
    } else {
      const newEmployee: Employee = {
        id: String(Date.now()),
        ...employeeData,
      };
      setEmployees([...employees, newEmployee]);
    }
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
            <Button onClick={handleAdd} className="gap-2" data-testid="button-add-employee">
              <Plus className="w-4 h-4" />
              Nuevo Empleado
            </Button>
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
      />

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
