import { MessageType } from '../enums/message.enum';

export interface Toast {
  id: string;
  message: string;
  type: MessageType;
  duration: number;
}

export interface Alert {
  id: string;
  title?: string;
  message: string;
  type: MessageType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
