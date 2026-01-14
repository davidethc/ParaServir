import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
  userEmail?: string;
}

export function DeleteAccountModal({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  userEmail,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  
  const requiredText = "ELIMINAR";
  const isConfirmed = confirmText === requiredText;

  const handleConfirm = async () => {
    if (!isConfirmed) {
      setConfirmError(`Debes escribir "${requiredText}" para confirmar`);
      return;
    }

    setConfirmError(null);
    await onConfirm();
    onOpenChange(false);
    setConfirmText("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      setConfirmText("");
      setConfirmError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <AlertDialogTitle className="text-xl">Eliminar Cuenta Permanentemente</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3">
            <p>
              Esta acción <strong>no se puede deshacer</strong>. Se eliminará permanentemente:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Tu cuenta y perfil</li>
              <li>Todos tus servicios (si eres trabajador)</li>
              <li>Todas tus solicitudes</li>
              <li>Todas tus reseñas</li>
            </ul>
            {userEmail && (
              <p className="text-sm font-medium mt-3">
                Cuenta: <span className="text-foreground">{userEmail}</span>
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="confirm-delete" className="text-sm font-medium">
            Para confirmar, escribe <strong className="text-destructive">{requiredText}</strong>:
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setConfirmError(null);
            }}
            placeholder={requiredText}
            disabled={loading}
            className={confirmError ? "border-destructive" : ""}
          />
          {confirmError && (
            <p className="text-sm text-destructive">{confirmError}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading || !isConfirmed}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar Cuenta Permanentemente"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

