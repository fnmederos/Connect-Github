import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import type { DailyAssignment } from "@shared/schema";

interface ExportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignments: DailyAssignment[];
}

export default function ExportExcelDialog({ open, onOpenChange, assignments }: ExportExcelDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const handleExport = () => {
    if (!startDate || !endDate) {
      return;
    }

    // Filtrar asignaciones por rango de fechas
    // Normalizar fechas para comparación correcta independiente de zona horaria
    const startDateNormalized = startOfDay(startDate);
    const endDateNormalized = endOfDay(endDate);
    
    const filteredAssignments = assignments.filter(assignment => {
      // Parsear fecha ISO del assignment y normalizar al inicio del día
      const assignmentDate = startOfDay(parseISO(assignment.date));
      return assignmentDate >= startDateNormalized && assignmentDate <= endDateNormalized;
    });

    if (filteredAssignments.length === 0) {
      toast({
        title: "Sin datos para exportar",
        description: "No hay planificaciones en el rango de fechas seleccionado.",
        variant: "destructive",
      });
      return;
    }

    // Preparar datos para Excel
    const excelData: any[] = [];

    filteredAssignments.forEach(assignment => {
      // Parse assignmentRows que está almacenado como JSON string
      const employees = JSON.parse(assignment.assignmentRows) as Array<{
        employeeId: string;
        employeeName: string;
        role: string;
        time: string;
      }>;
      
      // Si no hay empleados, saltar esta asignación
      if (employees.length === 0) {
        return;
      }
      
      // Encontrar el chofer
      const chofer = employees.find(emp => emp.role === "CHOFER");
      
      // Encontrar acompañantes (todos los que no son chofer)
      const acompanantes = employees.filter(emp => emp.role !== "CHOFER");

      // Crear UNA SOLA fila de Excel con todos los empleados del vehículo
      const excelRow = {
        FECHA: assignment.date,
        VEHICULO: assignment.vehicleName,
        MATRICULA: assignment.vehicleLicensePlate,
        CHOFER: chofer?.employeeName || "",
        "ACOMPAÑANTE 1": acompanantes[0]?.employeeName || "",
        "ACOMPAÑANTE 2": acompanantes[1]?.employeeName || "",
        "ACOMPAÑANTE 3": acompanantes[2]?.employeeName || "",
      };

      excelData.push(excelRow);
    });

    // Crear workbook y worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planificaciones");

    // Descargar archivo
    const fileName = `planificaciones_${format(startDate, "yyyy-MM-dd")}_${format(endDate, "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(wb, fileName);

    // Cerrar diálogo
    onOpenChange(false);
  };

  const isExportDisabled = !startDate || !endDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-export-excel">
        <DialogHeader>
          <DialogTitle>Exportar a Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha de inicio</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                  data-testid="button-start-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={es}
                  data-testid="calendar-start-date"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha de fin</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                  data-testid="button-end-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  locale={es}
                  data-testid="calendar-end-date"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-export"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExportDisabled}
            data-testid="button-confirm-export"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
