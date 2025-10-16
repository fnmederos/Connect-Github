import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, User } from "lucide-react";
import type { Employee } from "@shared/schema";

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export default function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  return (
    <Card className="p-4 hover-elevate">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-2" data-testid={`text-employee-name-${employee.id}`}>
              {employee.name}
            </h3>
            <div className="flex flex-wrap gap-1">
              {employee.roles?.map((role) => (
                <Badge 
                  key={role} 
                  variant="secondary" 
                  className="text-xs"
                  data-testid={`badge-employee-role-${employee.id}-${role}`}
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(employee)}
            data-testid={`button-edit-employee-${employee.id}`}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(employee.id)}
            data-testid={`button-delete-employee-${employee.id}`}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
