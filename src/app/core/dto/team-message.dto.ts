export interface SendTeamMessageRequest {
  content: string;
  attachment?: string;
  attachmentName?: string;
  mentions: string[];
}
