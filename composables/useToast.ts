import { useNuxtApp } from '#app';

interface ToastOptions {
  color?: string;
  title?: string;
  description: string;
  timeout?: number;
}

interface ToastMethods {
  add: (options: ToastOptions) => void;
}

declare module '#app' {
  interface NuxtApp {
    $toast: ToastMethods;
  }
}

export function useToast() {
  const nuxtApp = useNuxtApp();
  
  const success = (message: string) => {
    nuxtApp.$toast.add({
      color: 'green',
      title: 'Succès',
      description: message,
      timeout: 5000
    });
  };
  
  const error = (message: string) => {
    nuxtApp.$toast.add({
      color: 'red',
      title: 'Erreur',
      description: message,
      timeout: 5000
    });
  };
  
  const info = (message: string) => {
    nuxtApp.$toast.add({
      color: 'blue',
      title: 'Information',
      description: message,
      timeout: 5000
    });
  };
  
  const warning = (message: string) => {
    nuxtApp.$toast.add({
      color: 'yellow',
      title: 'Attention',
      description: message,
      timeout: 5000
    });
  };
  
  return {
    success,
    error,
    info,
    warning
  };
} 