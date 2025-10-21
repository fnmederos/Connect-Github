import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "@/lib/authUtils";
import { LogIn, Truck, Calendar, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Truck className="w-16 h-16 text-primary" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold">
            Sistema de Gestión Logística
          </CardTitle>
          <CardDescription className="text-lg">
            Plataforma integral para la planificación y gestión de operaciones logísticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
              <Calendar className="w-8 h-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Planificación</h3>
              <p className="text-sm text-muted-foreground">
                Organiza asignaciones diarias de manera eficiente
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
              <Users className="w-8 h-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Gestión de Personal</h3>
              <p className="text-sm text-muted-foreground">
                Administra empleados y sus funciones
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
              <Truck className="w-8 h-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Control de Vehículos</h3>
              <p className="text-sm text-muted-foreground">
                Seguimiento y asignación de flota
              </p>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              className="gap-2 text-lg px-8 py-6"
              onClick={login}
              data-testid="button-login"
            >
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
