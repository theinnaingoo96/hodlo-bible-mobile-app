export type Toast = {
    show: boolean;
    message: string;
    type: ToastType;
    duration: number; // in milliseconds
};

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'change';

// export type ReaderSetting = {
//     id: number;
//     name: string;
//     fontSize: number;
//     fontColor: string;
//     fontFamily: number;
//     backgroundColor: string;
// };

export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}