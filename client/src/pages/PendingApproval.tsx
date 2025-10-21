import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logout } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Clock, LogOut, Mail } from "lucide-react";

export default function PendingApproval() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-yellow-500/10 p-4 rounded-full">
              <Clock className="w-16 h-16 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            Cuenta Pendiente de Aprobación
          </CardTitle>
          <CardDescription data-testid="text-pending-message">
            Tu cuenta está pendiente de aprobación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>Email:</strong> {user?.email || 'No disponible'}
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              Un administrador revisará tu solicitud pronto. Recibirás acceso al sistema una vez que tu cuenta sea aprobada.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
