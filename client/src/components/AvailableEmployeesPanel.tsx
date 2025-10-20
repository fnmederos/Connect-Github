import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";
import type { Employee } from "@shared/schema";

interface AvailableEmployeesPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableEmployees: Employee[];
  allRoles: string[];
}

export default function AvailableEmployeesPanel({
  isOpen,
  onOpenChange,
  availableEmployees,
  allRoles,
}: AvailableEmployeesPanelProps) {
  const createRoleAbbreviation = (role: string): string => {
    const words = role.split(' ');
    if (words.length === 1) {
      return role.substring(0, 2).toUpperCase();
    }
    return words.map(w => w[0]).join('').toUpperCase().substring(0, 3);
  };

  const sortedEmployees = [...availableEmployees].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Personal Disponible
            <Badge variant="secondary" className="ml-auto">
              {availableEmployees.length}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-2 pr-4">
            {sortedEmployees.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Todo el personal está asignado
              </div>
            ) : (
              sortedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                  data-testid={`available-employee-${employee.id}`}
                >
                  <div className="font-medium text-sm">{employee.name}</div>
                  {employee.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {employee.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4 font-normal"
                        >
                          {createRoleAbbreviation(role)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
