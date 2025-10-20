import { Clock } from "lucide-react";
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
    <div className="bg-gray-50 p-6 min-w-[1000px]" data-testid="planning-export-view">
      {/* Encabezado compacto */}
      <div className="mb-4 pb-3 border-b-2 border-black">
        <h1 className="text-2xl font-bold text-black mb-1">
          Planificación Diaria - {format(date, "dd/MM/yyyy", { locale: es })}
        </h1>
      </div>

      {/* Vehículos - Formato compacto en línea */}
      {vehicles.length > 0 && (
        <div className="mb-6">
          <div className="space-y-2">
            {vehicles.map((vehicle) => {
              const assignments = vehicleAssignments[vehicle.id] || [];
              const comments = vehicleComments[vehicle.id] || '';
              
              if (assignments.length === 0 && !comments) return null;

              return (
                <div key={vehicle.id} className="border border-gray-400 bg-white p-2">
                  {/* Línea principal con toda la información */}
                  <div className="flex items-center flex-wrap gap-2 text-sm">
                    {/* Nombre y patente del vehículo */}
                    <span className="font-bold text-black">
                      {vehicle.name}
                    </span>
                    <span className="text-gray-700 font-mono">
                      ({vehicle.licensePlate})
                    </span>
                    
                    {/* Separador */}
                    {assignments.length > 0 && (
                      <span className="text-gray-400">|</span>
                    )}
                    
                    {/* Asignaciones todas en la misma línea */}
                    {assignments.map((assignment, index) => {
                      if (!assignment.employeeId || !assignment.role) return null;
                      
                      return (
                        <span key={assignment.id} className="flex items-center gap-1">
                          {index > 0 && <span className="text-gray-400">|</span>}
                          <span className="font-medium text-black">
                            {assignment.time}
                          </span>
                          <span className="text-gray-700">
                            {assignment.role}:
                          </span>
                          <span className="font-semibold text-black">
                            {getEmployeeName(assignment.employeeId)}
                          </span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Comentarios en línea separada si existen */}
                  {comments && (
                    <div className="mt-1 pt-1 border-t border-gray-200">
                      <span className="text-xs text-gray-700">
                        <span className="font-semibold">Comentarios:</span> {comments}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DEPOSITO - También compacto */}
      {depositoTimeSlots.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-black mb-2 pb-1 border-b border-gray-400">
            DEPOSITO
          </h2>
          <div className="border border-gray-400 bg-white p-2">
            <div className="space-y-1">
              {depositoTimeSlots.map((slot) => {
                const hasEmployees = slot.employees.some(emp => emp.employeeId);
                if (!hasEmployees) return null;

                return (
                  <div key={slot.id} className="flex items-center flex-wrap gap-2 text-sm">
                    {/* Horario */}
                    <span className="font-bold text-black flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.timeSlot}:
                    </span>
                    
                    {/* Empleados en línea */}
                    {slot.employees.map((emp, index) => {
                      if (!emp.employeeId) return null;
                      
                      return (
                        <span key={index} className="flex items-center gap-1">
                          {index > 0 && <span className="text-gray-400">|</span>}
                          {emp.isEncargado && (
                            <span className="inline-block px-1 bg-blue-200 text-blue-900 text-xs font-bold rounded border border-blue-400">
                              ENCARGADO
                            </span>
                          )}
                          <span className="font-semibold text-black">
                            {getEmployeeName(emp.employeeId)}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Comentarios del depósito */}
            {depositoComments && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-700">
                  <span className="font-semibold">Comentarios:</span> {depositoComments}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
