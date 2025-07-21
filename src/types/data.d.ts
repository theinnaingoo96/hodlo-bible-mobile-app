export type Toast = {
    show: boolean;
    message: string;
    type: ToastType;
    duration: number; // in milliseconds
};

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'change';