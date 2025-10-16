import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
}

export default function SaveTemplateDialog({
  open,
  onOpenChange,
  onSave,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-save-template">
        <DialogHeader>
          <DialogTitle>Guardar como Plantilla</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Nombre de la plantilla</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Lunes - Recorrido Normal"
              data-testid="input-template-name"
            />
            <p className="text-sm text-muted-foreground">
              La plantilla guardará los vehículos seleccionados y todas las asignaciones de personal.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel-save-template"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            data-testid="button-confirm-save-template"
          >
            Guardar Plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
