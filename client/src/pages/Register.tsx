import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Truck, UserPlus, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response: any = await apiRequest("POST", "/api/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });

      // Redirect based on approval status
      if (response.user?.isApproved) {
        setLocation("/");
      } else {
        setLocation("/pending-approval");
      }
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message || "Ocurrió un error al crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Truck className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>
            Completa el formulario para registrarte en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                minLength={3}
                maxLength={50}
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                data-testid="input-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
                data-testid="input-confirm-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading}
              data-testid="button-register"
            >
              {isLoading ? (
                "Creando cuenta..."
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>¿Ya tienes cuenta?</span>
              <button
                type="button"
                className="text-primary hover:underline font-normal"
                onClick={() => setLocation("/login")}
                data-testid="link-login"
              >
                Iniciar Sesión
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full gap-2"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
