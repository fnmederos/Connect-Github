import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { CalendarIcon, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Employee, EmployeeAbsence } from "@shared/schema";
import type { DateRange } from "react-day-picker";

interface AvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  absences: EmployeeAbsence[];
  onAddAbsence: (employeeId: string, startDate: string, endDate: string, reason: string) => void;
  onDeleteAbsence: (absenceId: string) => void;
}

export default function AvailabilityDialog({ 
  open, 
  onOpenChange, 
  employee,
  absences,
  onAddAbsence,
  onDeleteAbsence
}: AvailabilityDialogProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (!open) {
      setDateRange(undefined);
      setReason("");
      setShowCalendar(false);
    }
  }, [open]);

  const handleAddAbsence = () => {
    if (dateRange?.from && dateRange?.to && reason.trim()) {
      onAddAbsence(
        employee.id,
        dateRange.from.toISOString(),
        dateRange.to.toISOString(),
        reason.trim()
      );
      setDateRange(undefined);
      setReason("");
      setShowCalendar(false);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${format(start, "dd/MM/yyyy", { locale: es })} - ${format(end, "dd/MM/yyyy", { locale: es })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-availability">
        <DialogHeader>
          <DialogTitle>
            Disponibilidad: {employee.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Ausencias existentes */}
          <div className="space-y-3">
            <Label>Ausencias Registradas</Label>
            {absences.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No hay ausencias registradas</p>
            ) : (
              <div className="space-y-2">
                {absences.map((absence) => (
                  <div 
                    key={absence.id} 
                    className="flex items-center justify-between p-3 rounded-md border bg-card"
                    data-testid={`absence-${absence.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {formatDateRange(absence.startDate, absence.endDate)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {absence.reason}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDeleteAbsence(absence.id)}
                      data-testid={`button-delete-absence-${absence.id}`}
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agregar nueva ausencia */}
          <div className="space-y-3 pt-4 border-t">
            <Label>Agregar Nueva Ausencia</Label>
            
            {!showCalendar ? (
              <Button
                variant="outline"
                onClick={() => setShowCalendar(true)}
                className="w-full gap-2"
                data-testid="button-show-calendar"
              >
                <CalendarIcon className="w-4 h-4" />
                Seleccionar Rango de Fechas
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={es}
                    numberOfMonths={2}
                    data-testid="calendar-absence-range"
                  />
                </div>
                
                {dateRange?.from && dateRange?.to && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDateRange(dateRange.from.toISOString(), dateRange.to.toISOString())}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="absence-reason">Motivo</Label>
                      <Input
                        id="absence-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ej: Licencia médica, Vacaciones, Suspensión..."
                        data-testid="input-absence-reason"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDateRange(undefined);
                          setReason("");
                          setShowCalendar(false);
                        }}
                        data-testid="button-cancel-absence"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddAbsence}
                        disabled={!reason.trim()}
                        className="flex-1 gap-2"
                        data-testid="button-add-absence"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Ausencia
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-availability">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
