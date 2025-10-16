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

  const [selectedEmployees, setSelectedEmployees] = useState([availableEmployees[0]]);
  const [details, setDetails] = useState('');

  return (
    <AssignmentCard
      vehicle={vehicle}
      selectedEmployees={selectedEmployees}
      availableEmployees={availableEmployees}
      details={details}
      onAddEmployee={(id) => {
        const emp = availableEmployees.find(e => e.id === id);
        if (emp) setSelectedEmployees([...selectedEmployees, emp]);
      }}
      onRemoveEmployee={(id) => {
        setSelectedEmployees(selectedEmployees.filter(e => e.id !== id));
      }}
      onDetailsChange={setDetails}
    />
  );
}
