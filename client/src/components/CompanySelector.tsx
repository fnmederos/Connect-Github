import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Company } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CompanySelector() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");

  // Cargar empresas
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  // Cargar empresa seleccionada
  const { data: selectedCompany } = useQuery<Company | null>({
    queryKey: ['/api/companies/selected'],
  });

  // Mutación para seleccionar empresa
  const selectCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      return await apiRequest('POST', `/api/companies/${companyId}/select`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/selected'] });
      toast({
        title: "Empresa seleccionada",
        description: "La empresa se seleccionó correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  // Mutación para crear empresa
  const createCompanyMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest('POST', '/api/companies', { name });
      return response.json();
    },
    onSuccess: (newCompany: Company) => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setIsCreateDialogOpen(false);
      setNewCompanyName("");
      
      // Seleccionar automáticamente la nueva empresa
      selectCompanyMutation.mutate(newCompany.id);
      
      toast({
        title: "Empresa creada",
        description: "La empresa se creó correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error al crear empresa",
        description: error.message,
      });
    },
  });

  const handleSelectCompany = (companyId: string) => {
    if (companyId === "create-new") {
      setIsCreateDialogOpen(true);
    } else {
      selectCompanyMutation.mutate(companyId);
    }
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre de la empresa es requerido",
      });
      return;
    }
    createCompanyMutation.mutate(newCompanyName.trim());
  };

  if (isLoadingCompanies) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-[200px] bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Select
          value={selectedCompany?.id || ""}
          onValueChange={handleSelectCompany}
          data-testid="select-company"
        >
          <SelectTrigger className="w-[200px]" data-testid="trigger-company-select">
            <SelectValue placeholder="Seleccionar empresa" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem 
                key={company.id} 
                value={company.id}
                data-testid={`option-company-${company.id}`}
              >
                {company.name}
              </SelectItem>
            ))}
            <SelectItem 
              value="create-new"
              data-testid="option-create-company"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Nueva empresa</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent data-testid="dialog-create-company">
          <DialogHeader>
            <DialogTitle>Crear Nueva Empresa</DialogTitle>
            <DialogDescription>
              Ingresa el nombre de la nueva empresa
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCompany}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="company-name">Nombre de la empresa</Label>
                <Input
                  id="company-name"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Mi Empresa S.A."
                  data-testid="input-company-name"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                data-testid="button-cancel-company"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createCompanyMutation.isPending}
                data-testid="button-create-company"
              >
                {createCompanyMutation.isPending ? "Creando..." : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
