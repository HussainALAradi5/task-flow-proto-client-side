import { MessageType } from '../enums/message.enum';

export interface Toast {
  id: string;
  message: string;
  type: MessageType;
  duration: number;
}
