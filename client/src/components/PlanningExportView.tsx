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
  vehicleLoadingStatus: Record<string, string>;
  depositoTimeSlots: DepositoTimeSlot[];
  depositoComments: string;
  employees: Employee[];
}

export default function PlanningExportView({
  date,
  vehicles,
  vehicleAssignments,
  vehicleComments,
  vehicleLoadingStatus,
  depositoTimeSlots,
  depositoComments,
  employees,
}: PlanningExportViewProps) {
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || '';
  };

  const getRoleColor = (role: string) => {
    if (role === 'CHOFER') {
      return 'text-emerald-700 font-semibold';
    } else if (role === 'ACOMPAÑANTE') {
      return 'text-amber-600 font-semibold';
    } else if (role === 'ENCARGADO') {
      return 'text-blue-600 font-semibold';
    }
    return 'text-gray-700';
  };

  const getStatusBadgeColor = (status: string) => {
    if (status === "CARGADO") {
      return "bg-green-600 text-white";
    }
    
    // Extraer el número de la posición
    const match = status.match(/^(\d+)° EN CARGAR$/);
    if (!match) return "";
    
    const position = parseInt(match[1]);
    
    // Paleta de colores oscuros para PNG export (fondo gris claro)
    const colors = [
      "bg-red-600 text-white",       // 1°
      "bg-orange-600 text-white",    // 2°
      "bg-yellow-600 text-black",    // 3°
      "bg-blue-600 text-white",      // 4°
      "bg-purple-600 text-white",    // 5°
      "bg-pink-600 text-white",      // 6°
      "bg-indigo-600 text-white",    // 7°
      "bg-cyan-600 text-white",      // 8°
      "bg-teal-600 text-white",      // 9°
      "bg-lime-600 text-black",      // 10°
    ];
    
    // Si hay más vehículos que colores, ciclar los colores
    return colors[(position - 1) % colors.length];
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
              const loadingStatus = vehicleLoadingStatus[vehicle.id] || '';
              
              if (assignments.length === 0 && !comments && !loadingStatus) return null;

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
                    
                    {/* Estado de carga badge */}
                    {loadingStatus && (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusBadgeColor(loadingStatus)}`}>
                        {loadingStatus}
                      </span>
                    )}
                    
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
                          <span className={getRoleColor(assignment.role)}>
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
                    <span className="font-bold text-black">
                      {slot.timeSlot}:
                    </span>
                    
                    {/* Empleados en línea */}
                    {slot.employees.map((emp, index) => {
                      if (!emp.employeeId) return null;
                      
                      return (
                        <span key={index} className="flex items-center gap-1">
                          {index > 0 && <span className="text-gray-400">|</span>}
                          <span className="font-semibold text-black">
                            {getEmployeeName(emp.employeeId)}
                          </span>
                          {emp.isEncargado && (
                            <span className="text-blue-600 font-bold text-xs">
                              ENCARGADO
                            </span>
                          )}
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
