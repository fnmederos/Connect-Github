import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { DailyAssignment, AssignmentRowData, DepositoTimeSlot } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function History() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Fetch all daily assignments
  const { data: allAssignments = [] } = useQuery<DailyAssignment[]>({
    queryKey: ['/api/daily-assignments'],
  });

  // Agrupar asignaciones por fecha
  const assignmentsByDate = allAssignments.reduce((acc, assignment) => {
    if (!acc[assignment.date]) {
      acc[assignment.date] = [];
    }
    acc[assignment.date].push(assignment);
    return acc;
  }, {} as Record<string, DailyAssignment[]>);

  // Obtener fechas únicas y ordenadas (más reciente primero)
  const uniqueDates = Object.keys(assignmentsByDate).sort((a, b) => b.localeCompare(a));

  const handleViewDetail = (date: string) => {
    setSelectedDate(date);
    setDetailDialogOpen(true);
  };

  const selectedAssignments = selectedDate ? assignmentsByDate[selectedDate] : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-history-title">
              Historial de Planificaciones
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Consulta las planificaciones guardadas por día
            </p>
          </div>

          {uniqueDates.length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No hay planificaciones guardadas</p>
              <p className="text-sm text-muted-foreground">
                Las planificaciones que guardes desde el Dashboard aparecerán aquí
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueDates.map((date) => {
                const dateAssignments = assignmentsByDate[date];
                const totalVehicles = dateAssignments.length;
                const totalEmployees = dateAssignments.reduce((sum, assignment) => {
                  const rows = JSON.parse(assignment.assignmentRows) as AssignmentRowData[];
                  return sum + rows.length;
                }, 0);

                return (
                  <Card 
                    key={date} 
                    className="hover-elevate cursor-pointer" 
                    onClick={() => handleViewDetail(date)}
                    data-testid={`card-history-${date}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{format(parseISO(date), "PPP", { locale: es })}</span>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>
                        {totalVehicles} {totalVehicles === 1 ? 'vehículo' : 'vehículos'} • {totalEmployees} {totalEmployees === 1 ? 'persona' : 'personas'}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dialog para mostrar detalle del día */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Planificación del {selectedDate && format(parseISO(selectedDate), "PPP", { locale: es })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {selectedAssignments.map((assignment) => {
              const rows = JSON.parse(assignment.assignmentRows) as AssignmentRowData[];
              
              return (
                <Card key={assignment.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {assignment.vehicleName}
                    </CardTitle>
                    <CardDescription>
                      Patente: {assignment.vehicleLicensePlate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rows.map((row, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                          data-testid={`row-assignment-${index}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{row.employeeName}</span>
                              <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                                {row.role}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {row.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {(() => {
              // Buscar cualquier assignment que tenga comentarios
              const assignmentWithComments = selectedAssignments.find(a => a.comments && a.comments.trim().length > 0);
              if (!assignmentWithComments) return null;
              
              return (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Comentarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{assignmentWithComments.comments}</p>
                  </CardContent>
                </Card>
              );
            })()}

            {(() => {
              // Buscar cualquier assignment que tenga DEPOSITO assignments
              const assignmentWithDeposito = selectedAssignments.find(a => {
                if (!a.depositoAssignments) return false;
                try {
                  const data = JSON.parse(a.depositoAssignments) as DepositoTimeSlot[];
                  return data.length > 0;
                } catch {
                  return false;
                }
              });
              
              if (!assignmentWithDeposito || !assignmentWithDeposito.depositoAssignments) return null;
              
              const depositoData = JSON.parse(assignmentWithDeposito.depositoAssignments) as DepositoTimeSlot[];
              
              return (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">DEPOSITO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {depositoData.map((slot, slotIndex) => (
                        <div key={slotIndex} className="border rounded-md p-3">
                          <div className="font-medium text-sm mb-2">{slot.timeSlot}</div>
                          <div className="space-y-1">
                            {slot.employees.map((emp, empIndex) => (
                              <div 
                                key={empIndex}
                                className={`text-sm p-2 rounded-md ${
                                  emp.isEncargado ? 'bg-primary/10 border border-primary font-semibold' : 'bg-muted/50'
                                }`}
                              >
                                {emp.isEncargado && <span className="text-primary mr-2">ENCARGADO:</span>}
                                {emp.employeeName}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {assignmentWithDeposito.depositoComments && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="font-medium text-sm mb-2">Comentarios</div>
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {assignmentWithDeposito.depositoComments}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDetailDialogOpen(false)}
              data-testid="button-close-detail"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
