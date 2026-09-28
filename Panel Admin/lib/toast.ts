type ToastType = 'success' | 'error' | 'info';

type ToastEvent = {
  message: string;
  type: ToastType;
};

type ToastListener = (toast: ToastEvent) => void;

const listeners: ToastListener[] = [];

export const toast = {
  success: (message: string) => emit({ message, type: 'success' }),
  error: (message: string) => emit({ message, type: 'error' }),
  info: (message: string) => emit({ message, type: 'info' }),
  subscribe: (listener: ToastListener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }
};

function emit(event: ToastEvent) {
  listeners.forEach(l => l(event));
}
