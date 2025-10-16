import VehicleDialog from '../VehicleDialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function VehicleDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Abrir Diálogo</Button>
      <VehicleDialog
        open={open}
        onOpenChange={setOpen}
        onSave={(veh) => console.log('Save vehicle:', veh)}
      />
    </div>
  );
}
