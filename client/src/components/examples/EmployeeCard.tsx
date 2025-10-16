import EmployeeCard from '../EmployeeCard';

export default function EmployeeCardExample() {
  const employee = {
    id: '1',
    name: 'Juan Pérez',
    role: 'Conductor',
  };

  return (
    <EmployeeCard
      employee={employee}
      onEdit={(emp) => console.log('Edit employee:', emp)}
      onDelete={(id) => console.log('Delete employee:', id)}
    />
  );
}
