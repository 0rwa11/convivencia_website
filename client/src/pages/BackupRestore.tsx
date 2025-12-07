import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEvaluation } from '@/contexts/EvaluationContext';
import { useMultiUser } from '@/contexts/MultiUserContext';
import { getBackups, createBackup, restoreBackup, deleteBackup, exportBackupAsJSON, importBackupFromJSON } from '@/lib/backupUtils';
import { Download, Upload, Trash2, RotateCcw, Plus } from 'lucide-react';

export default function BackupRestore() {
  const { records } = useEvaluation();
  const { isAdmin } = useMultiUser();
  const [backups, setBackups] = useState(getBackups());
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateBackup = () => {
    const name = prompt('Nombre para este respaldo:');
    if (name) {
      createBackup(records, name);
      setBackups(getBackups());
      alert('Respaldo creado exitosamente');
    }
  };

  const handleRestoreBackup = (backupId: string) => {
    if (window.confirm('¿Estás seguro? Esto sobrescribirá todos los datos actuales.')) {
      restoreBackup(backupId);
      alert('Respaldo restaurado. Recarga la página para ver los cambios.');
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este respaldo?')) {
      deleteBackup(backupId);
      setBackups(getBackups());
    }
  };

  const handleExportBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (backup) {
      exportBackupAsJSON(backup);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const result = await importBackupFromJSON(file);
      if (result) {
        setBackups(getBackups());
        alert('Respaldo importado exitosamente');
      } else {
        alert('Error al importar el respaldo');
      }
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportAllData = () => {
    const json = JSON.stringify(records, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `datos_completos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <Card className="p-8 border-0 shadow-sm max-w-md">
          <p className="text-center text-muted-foreground">
            Solo los administradores pueden acceder a esta página.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Respaldos y Restauración</h1>
          <p className="text-lg text-muted-foreground">
            Gestiona respaldos de datos y sincronización
          </p>
        </div>

        {/* Actions */}
        <Card className="p-6 border-0 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Acciones</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCreateBackup} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Crear Respaldo
            </Button>
            <Button onClick={handleExportAllData} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar Todos los Datos
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar Respaldo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </div>
        </Card>

        {/* Current Data Info */}
        <Card className="p-6 border-0 shadow-sm mb-8 bg-blue-50">
          <h3 className="text-lg font-bold text-foreground mb-4">Estado Actual</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Evaluaciones</p>
              <p className="text-3xl font-bold text-blue-700">{records.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Respaldos</p>
              <p className="text-3xl font-bold text-blue-700">{backups.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tamaño Datos</p>
              <p className="text-3xl font-bold text-blue-700">
                {(JSON.stringify(records).length / 1024).toFixed(1)} KB
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Actualización</p>
              <p className="text-sm font-bold text-blue-700">
                {records.length > 0
                  ? new Date(records[records.length - 1].date).toLocaleDateString('es-ES')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Backups List */}
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Respaldos Disponibles</h3>
          {backups.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay respaldos disponibles. Crea uno para empezar.
            </p>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{backup.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {backup.recordCount} evaluaciones • {new Date(backup.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportBackup(backup.id)}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreBackup(backup.id)}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restaurar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBackup(backup.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info */}
        <Card className="p-6 border-0 shadow-sm mt-8 bg-amber-50">
          <h3 className="text-lg font-bold text-foreground mb-2">Información Importante</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Se guardan automáticamente hasta 10 respaldos</li>
            <li>• Los respaldos más antiguos se eliminan automáticamente</li>
            <li>• Puedes exportar respaldos como JSON para guardarlos en otro lugar</li>
            <li>• Importa respaldos JSON para recuperar datos</li>
            <li>• Se recomienda crear respaldos regularmente</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
