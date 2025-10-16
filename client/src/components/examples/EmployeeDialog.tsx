import EmployeeDialog from '../EmployeeDialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function EmployeeDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Abrir Diálogo</Button>
      <EmployeeDialog
        open={open}
        onOpenChange={setOpen}
        onSave={(emp) => console.log('Save employee:', emp)}
      />
    </div>
  );
}
