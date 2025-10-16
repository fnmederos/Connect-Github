import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Template } from "@shared/schema";

interface LoadTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  onLoad: (template: Template) => void;
  onDelete: (templateId: string) => void;
}

export default function LoadTemplateDialog({
  open,
  onOpenChange,
  templates,
  onLoad,
  onDelete,
}: LoadTemplateDialogProps) {
  const handleLoad = (template: Template) => {
    onLoad(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-load-template">
        <DialogHeader>
          <DialogTitle>Cargar Plantilla</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No hay plantillas guardadas. Crea una desde el Dashboard.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                    data-testid={`template-item-${template.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate" data-testid={`template-name-${template.id}`}>
                        {template.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>
                          {template.vehicleIds.length} vehículo{template.vehicleIds.length !== 1 ? 's' : ''}
                        </span>
                        {template.createdAt && (
                          <span>
                            {format(new Date(template.createdAt), "PPP", { locale: es })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => handleLoad(template)}
                        data-testid={`button-load-template-${template.id}`}
                      >
                        Cargar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(template.id)}
                        data-testid={`button-delete-template-${template.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-load-template"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
