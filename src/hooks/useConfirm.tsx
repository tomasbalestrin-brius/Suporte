import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

/**
 * Hook for showing confirmation dialogs
 * Returns [ConfirmDialog component, confirm function]
 */
export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    description: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'default',
  });
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions({
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      variant: 'default',
      ...opts,
    });
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolveCallback(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveCallback) {
      resolveCallback(true);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveCallback) {
      resolveCallback(false);
    }
  };

  const ConfirmDialog = () => (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          <AlertDialogDescription>{options.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {options.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={options.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {options.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { ConfirmDialog, confirm };
}
