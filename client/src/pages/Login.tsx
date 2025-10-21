import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Truck, LogIn, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response: any = await apiRequest("POST", "/api/login", {
        username: formData.username,
        password: formData.password,
      });

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de vuelta",
      });

      // Redirect based on approval status
      if (response.user?.isApproved) {
        setLocation("/");
      } else {
        setLocation("/pending-approval");
      }
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Usuario o contraseña incorrectos",
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
          <CardTitle className="text-3xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
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
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                "Iniciando sesión..."
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>¿No tienes cuenta?</span>
              <button
                type="button"
                className="text-primary hover:underline font-normal"
                onClick={() => setLocation("/register")}
                data-testid="link-register"
              >
                Registrarse
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
