import { useState, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Upload, X, File, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import { HttpClientService } from "@/shared/services/http-client.service";
import { API_CONFIG } from "@/modules/Reviews/infra/http/api.config";

interface FileUploadProps {
  type: 'certification' | 'avatar';
  onSuccess?: (fileUrl: string) => void;
  currentFileUrl?: string | null;
}

export function FileUpload({ type, onSuccess, currentFileUrl }: FileUploadProps) {
  const { getToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF) o PDF');
      return;
    }

    // Validar tamaño (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('El archivo no debe exceder 5MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Sesión expirada. Inicia sesión nuevamente.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = type === 'certification' ? '/upload/certification' : '/upload/avatar';
      
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al subir el archivo');
      }

      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onSuccess && data.file_url) {
        onSuccess(data.file_url);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir el archivo';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`file-upload-${type}`}>
          {type === 'certification' ? 'Certificación' : 'Avatar'}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id={`file-upload-${type}`}
            type="file"
            accept={type === 'certification' ? '.pdf,.jpg,.jpeg,.png' : '.jpg,.jpeg,.png,.gif'}
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="flex-1"
          />
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {file && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <File className="h-4 w-4" />
            <span className="text-sm flex-1 truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}
        {currentFileUrl && (
          <div className="text-sm text-muted-foreground">
            Archivo actual: <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver</a>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Archivo subido correctamente
          </AlertDescription>
        </Alert>
      )}

      {file && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir Archivo
            </>
          )}
        </Button>
      )}
    </div>
  );
}
