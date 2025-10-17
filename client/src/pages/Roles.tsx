import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Role } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Roles() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const { toast } = useToast();

  // Fetch roles from API
  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ['/api/roles-detailed'],
  });

  // Mutation to create role
  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return await apiRequest('POST', '/api/roles-detailed', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setDialogOpen(false);
      setRoleName("");
      toast({
        title: "Rol creado",
        description: "El rol ha sido creado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el rol: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to update role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
      return await apiRequest('PUT', `/api/roles-detailed/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setDialogOpen(false);
      setSelectedRole(null);
      setRoleName("");
      toast({
        title: "Rol actualizado",
        description: "El rol ha sido actualizado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el rol: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete role
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/roles-detailed/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete role');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      toast({
        title: "Rol eliminado",
        description: "El rol ha sido eliminado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el rol: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    setSelectedRole(null);
    setRoleName("");
    setDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!roleName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del rol no puede estar vacío.",
        variant: "destructive",
      });
      return;
    }

    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, data: { name: roleName } });
    } else {
      createRoleMutation.mutate({ name: roleName });
    }
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteRoleMutation.mutate(roleToDelete.id);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Funciones</h1>
        <Button 
          onClick={handleAdd}
          data-testid="button-add-role"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Función
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando funciones...</div>
      ) : roles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay funciones configuradas. Crea una nueva función para comenzar.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de la Función</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} data-testid={`row-role-${role.id}`}>
                  <TableCell className="font-medium" data-testid={`text-role-name-${role.id}`}>
                    {role.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(role)}
                        data-testid={`button-edit-role-${role.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(role)}
                        data-testid={`button-delete-role-${role.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dialog-role-form">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Editar Función" : "Nueva Función"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Nombre de la Función</Label>
              <Input
                id="role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Ej: CHOFER, OPERARIO, etc."
                data-testid="input-role-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-testid="button-cancel-role"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
              data-testid="button-save-role"
            >
              {(createRoleMutation.isPending || updateRoleMutation.isPending) 
                ? "Guardando..." 
                : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-confirm-delete-role">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la función "{roleToDelete?.name}" permanentemente.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-role">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteRoleMutation.isPending}
              data-testid="button-confirm-delete-role"
            >
              {deleteRoleMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
