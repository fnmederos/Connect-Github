import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, ArrowLeft, Shield } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { User } from "@shared/schema";

export default function AdminPanel() {
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('POST', `/api/admin/approve-user/${userId}`);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Usuario aprobado",
        description: "El usuario ha sido aprobado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo aprobar el usuario: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('POST', `/api/admin/reject-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Usuario rechazado",
        description: "El usuario ha sido rechazado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo rechazar el usuario: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-4" data-testid="button-back-dashboard">
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Panel de Administración</CardTitle>
              <CardDescription>Gestiona usuarios y permisos del sistema</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay usuarios registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Solicitado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium" data-testid={`text-username-${user.id}`}>
                        {user.username}
                      </TableCell>
                      <TableCell data-testid={`text-email-${user.id}`}>
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isApproved ? 'default' : 'outline'}>
                          {user.isApproved ? 'Aprobado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(user.requestedAt), "PPP", { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        {!user.isApproved && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="default"
                              className="gap-1 bg-green-600 hover:bg-green-700"
                              onClick={() => approveMutation.mutate(user.id)}
                              disabled={approveMutation.isPending}
                              data-testid={`button-approve-${user.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                              onClick={() => rejectMutation.mutate(user.id)}
                              disabled={rejectMutation.isPending}
                              data-testid={`button-reject-${user.id}`}
                            >
                              <XCircle className="w-4 h-4" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                        {user.isApproved && (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
