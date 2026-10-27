export interface TeamMessage {
  _id: string;
  teamId: string;
  author: { _id: string; userName: string };
  content: string;
  attachment?: string;
  createdAt: string;
}
