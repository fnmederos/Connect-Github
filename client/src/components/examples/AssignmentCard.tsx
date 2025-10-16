import AssignmentCard from '../AssignmentCard';
import { useState } from 'react';

export default function AssignmentCardExample() {
  const vehicle = {
    id: '1',
    name: 'Camión 1',
    licensePlate: 'ABC-1234',
  };

  const availableEmployees = [
    { id: '1', name: 'Juan Pérez', role: 'Conductor' },
    { id: '2', name: 'María García', role: 'Ayudante' },
    { id: '3', name: 'Carlos López', role: 'Conductor' },
  ];

  const availableRoles = ['CHOFER', 'PEON', 'AYUDANTE', 'OPERARIO'];

  const [assignments, setAssignments] = useState([
    { id: '1', role: 'CHOFER', employeeId: '1', time: '08:00' },
    { id: '2', role: 'PEON', employeeId: '2', time: '08:00' },
  ]);

  const handleAddRow = () => {
    setAssignments([...assignments, {
      id: String(Date.now()),
      role: '',
      employeeId: '',
      time: '08:00',
    }]);
  };

  const handleRemoveRow = (rowId: string) => {
    setAssignments(assignments.filter(a => a.id !== rowId));
  };

  const handleUpdateRole = (rowId: string, role: string) => {
    setAssignments(assignments.map(a => a.id === rowId ? { ...a, role } : a));
  };

  const handleUpdateEmployee = (rowId: string, employeeId: string) => {
    setAssignments(assignments.map(a => a.id === rowId ? { ...a, employeeId } : a));
  };

  const handleUpdateTime = (rowId: string, time: string) => {
    setAssignments(assignments.map(a => a.id === rowId ? { ...a, time } : a));
  };

  return (
    <AssignmentCard
      vehicle={vehicle}
      availableEmployees={availableEmployees}
      availableRoles={availableRoles}
      assignments={assignments}
      onAddRow={handleAddRow}
      onRemoveRow={handleRemoveRow}
      onUpdateRole={handleUpdateRole}
      onUpdateEmployee={handleUpdateEmployee}
      onUpdateTime={handleUpdateTime}
    />
  );
}
