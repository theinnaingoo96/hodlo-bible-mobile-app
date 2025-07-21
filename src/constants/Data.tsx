import { AppColors } from "./Color";

export const languages = [
    {
        name: 'Ho Dlo',
        code: 'hd',
        selected: true,
    },
    {
        name: 'English',
        code: 'en',
        selected: false,
    },
    {
        name: 'Myanmar',
        code: 'mm',
        selected: false,
    },
];

export const constants = {
    toastDuration: 3000,
    toast: {
        success: { color: '#28a745', icon: 'check' },
        error: { color: '#dc3545', icon: 'xmark' },
        warning: { color: '#ffc107', icon: 'triangle-exclamation' },
        info: { color: '#17a2b8', icon: 'circle-info' },
        change: { color: AppColors.primaryDark, icon: 'book-open' },
    },
};
// 'arrows-rotate'