import { NotificationKind } from '../enums/notification-kind.enum';

export interface Notification {
  _id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  href: string;
  readAt: string | null;
  createdAt: string;
}
