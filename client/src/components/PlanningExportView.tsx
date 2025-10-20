import { Card } from "@/components/ui/card";
import { Truck, Clock } from "lucide-react";
import type { Vehicle, Employee, DepositoTimeSlot } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AssignmentRow {
  id: string;
  role: string;
  employeeId: string;
  time: string;
}

interface PlanningExportViewProps {
  date: Date;
  vehicles: Vehicle[];
  vehicleAssignments: Record<string, AssignmentRow[]>;
  vehicleComments: Record<string, string>;
  depositoTimeSlots: DepositoTimeSlot[];
  depositoComments: string;
  employees: Employee[];
}

export default function PlanningExportView({
  date,
  vehicles,
  vehicleAssignments,
  vehicleComments,
  depositoTimeSlots,
  depositoComments,
  employees,
}: PlanningExportViewProps) {
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || '';
  };

  return (
    <div className="bg-white p-8 min-w-[800px]" data-testid="planning-export-view">
      {/* Encabezado */}
      <div className="mb-6 pb-4 border-b-2 border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Planificación Diaria
        </h1>
        <p className="text-xl text-gray-600">
          {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Vehículos */}
      {vehicles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Truck className="w-6 h-6" />
            Vehículos
          </h2>
          <div className="space-y-4">
            {vehicles.map((vehicle) => {
              const assignments = vehicleAssignments[vehicle.id] || [];
              const comments = vehicleComments[vehicle.id] || '';
              
              if (assignments.length === 0 && !comments) return null;

              return (
                <Card key={vehicle.id} className="p-4 border-2 border-gray-300">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {vehicle.name}
                    </h3>
                    <p className="text-sm font-mono text-gray-600">
                      {vehicle.licensePlate}
                    </p>
                  </div>

                  {assignments.length > 0 && (
                    <div className="mb-3">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-2 px-2 font-bold text-gray-700">Horario</th>
                            <th className="text-left py-2 px-2 font-bold text-gray-700">Función</th>
                            <th className="text-left py-2 px-2 font-bold text-gray-700">Personal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignments.map((assignment) => {
                            if (!assignment.employeeId || !assignment.role) return null;
                            
                            return (
                              <tr key={assignment.id} className="border-b border-gray-200">
                                <td className="py-2 px-2 font-medium text-gray-900 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {assignment.time}
                                </td>
                                <td className="py-2 px-2 text-gray-800">{assignment.role}</td>
                                <td className="py-2 px-2 font-medium text-gray-900">
                                  {getEmployeeName(assignment.employeeId)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {comments && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Comentarios:</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{comments}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* DEPOSITO */}
      {depositoTimeSlots.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">DEPOSITO</h2>
          <Card className="p-4 border-2 border-gray-300">
            <div className="space-y-3">
              {depositoTimeSlots.map((slot) => {
                const hasEmployees = slot.employees.some(emp => emp.employeeId);
                if (!hasEmployees) return null;

                return (
                  <div key={slot.id} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                    <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Horario: {slot.timeSlot}
                    </div>
                    <div className="pl-6 space-y-1">
                      {slot.employees.map((emp, index) => {
                        if (!emp.employeeId) return null;
                        
                        return (
                          <div key={index} className="flex items-center gap-2">
                            {emp.isEncargado && (
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded border border-blue-300">
                                ENCARGADO
                              </span>
                            )}
                            <span className="font-medium text-gray-900">
                              {getEmployeeName(emp.employeeId)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {depositoComments && (
              <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-1">Comentarios:</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{depositoComments}</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
