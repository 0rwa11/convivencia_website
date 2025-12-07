import { useState } from 'react';
import { useMultiUser } from '@/contexts/MultiUserContext';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, UserPlus } from 'lucide-react';

export default function MultiUserLogin() {
  const { login, registerFacilitator } = useMultiUser();
  const [, setLocation] = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (login(name, email)) {
      setLocation('/');
      window.location.reload();
    } else {
      setError('Usuario no encontrado. Verifica nombre y email.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido');
      return;
    }

    if (registerFacilitator(name, email)) {
      setError('');
      setName('');
      setEmail('');
      setIsRegistering(false);
      alert('Facilitador registrado exitosamente. Ahora puedes iniciar sesión.');
    } else {
      setError('Este email ya está registrado');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-0 shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-lg mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Convivencia</h1>
          <p className="text-muted-foreground">Centro de Día</p>
        </div>

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
          >
            {isRegistering ? (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Registrarse
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setName('');
              setEmail('');
            }}
            className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium"
          >
            {isRegistering
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Sitio protegido para el equipo del Centro de Día
        </p>
      </Card>
    </div>
  );
}
