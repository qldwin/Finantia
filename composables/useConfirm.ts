/**
 * Composable pour les modals de confirmation
 * Remplace les appels natifs à confirm()
 */

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const useConfirm = () => {
  const isOpen = ref(false);
  const options = ref<ConfirmOptions>({
    title: 'Confirmer',
    message: 'Êtes-vous sûr ?',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    type: 'info'
  });

  let resolvePromise: (value: boolean) => void;

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    options.value = {
      title: opts.title || 'Confirmer',
      message: opts.message,
      confirmText: opts.confirmText || 'Confirmer',
      cancelText: opts.cancelText || 'Annuler',
      type: opts.type || 'info'
    };

    isOpen.value = true;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  const handleConfirm = () => {
    isOpen.value = false;
    resolvePromise(true);
  };

  const handleCancel = () => {
    isOpen.value = false;
    resolvePromise(false);
  };

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel
  };
};
