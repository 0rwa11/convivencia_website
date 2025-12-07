import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, AlertCircle } from 'lucide-react';
import { usePasswordProtection } from '@/contexts/PasswordProtectionContext';

export default function PasswordLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { authenticate } = usePasswordProtection();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Por favor ingresa la contraseña');
      return;
    }

    if (authenticate(password)) {
      setLocation('/dashboard');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white">
            <Lock className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-foreground mb-2">Convivencia</h1>
        <p className="text-center text-muted-foreground mb-8">Centro de Día</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white"
          >
            Acceder
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Sitio protegido para el equipo del Centro de Día
        </p>
      </Card>
    </div>
  );
}
