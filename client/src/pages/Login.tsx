import { useState, useEffect } from 'react';
import { usePassword } from '@/contexts/PasswordContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { authenticate, isAuthenticated } = usePassword();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/multi-login');
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authenticate(password)) {
      setPassword('');
      setLocation('/multi-login');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Convivencia</h1>
            <p className="text-muted-foreground">Centro de Día</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full">
              Acceder
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Sitio protegido para el equipo del Centro de Día
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
