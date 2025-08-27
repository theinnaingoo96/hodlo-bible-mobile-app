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
    fontFamily: [
        {
            id: 1,
            name: 'NotoSans',
            regular: 'NotoSansMyanmar-Regular',
            bold: 'NotoSansMyanmar-SemiBold',
            lineHeight: 28
        },
        {
            id: 2,
            name: 'Pretendard',
            regular: 'Pretendard-Regular',
            bold: 'Pretendard-SemiBold',
            lineHeight: 30
        },

        {
            id: 3,
            name: 'Pyidaungsu',
            regular: 'Pyidaungsu-Regular',
            bold: 'Pyidaungsu-Bold',
            lineHeight: 28
        }
    ],
    theme: [
        {
            id: 1,
            name: 'Light',
            fontColor: '#454545',
            backgroundColor: '#FFFFFF',
            toolbarColor: '#FFFFFF',
            buttonColor: '#C40111',
        }, {
            id: 2,
            name: 'Dark',
            fontColor: '#EEEEEE',
            backgroundColor: '#333333',
            toolbarColor: '#333333',
            buttonColor: '#FFFFFF',
        }, {
            id: 3,
            name: 'Sepia',
            fontColor: '#2F1E06',
            backgroundColor: '#F3E2CA',
            toolbarColor: '#F3E2CA',
            buttonColor: '#C40111',
        }
    ],
};
// 'arrows-rotate'