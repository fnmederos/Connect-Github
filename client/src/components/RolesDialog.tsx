import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface RolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: string[];
  onSave: (roles: string[]) => void;
}

export default function RolesDialog({ open, onOpenChange, roles, onSave }: RolesDialogProps) {
  const [currentRoles, setCurrentRoles] = useState<string[]>([]);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    setCurrentRoles([...roles]);
    setNewRole("");
  }, [roles, open]);

  const handleAddRole = () => {
    const trimmedRole = newRole.trim().toUpperCase();
    if (trimmedRole && !currentRoles.includes(trimmedRole)) {
      setCurrentRoles([...currentRoles, trimmedRole]);
      setNewRole("");
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setCurrentRoles(currentRoles.filter(r => r !== roleToRemove));
  };

  const handleSave = () => {
    if (currentRoles.length > 0) {
      onSave(currentRoles);
      onOpenChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRole();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-roles">
        <DialogHeader>
          <DialogTitle>Gestionar Funciones</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-role">Agregar Nueva Función</Label>
            <div className="flex gap-2">
              <Input
                id="new-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ej: MECANICO"
                data-testid="input-new-role"
              />
              <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                onClick={handleAddRole}
                disabled={!newRole.trim()}
                data-testid="button-add-new-role"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Funciones Disponibles</Label>
            {currentRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No hay funciones configuradas</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentRoles.map((role) => (
                  <Badge 
                    key={role} 
                    variant="secondary" 
                    className="gap-1 pr-1"
                    data-testid={`badge-available-role-${role}`}
                  >
                    {role}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveRole(role)}
                      data-testid={`button-remove-available-role-${role}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-roles">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={currentRoles.length === 0} data-testid="button-save-roles">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
