export interface TeamInvitation {
  _id: string;
  teamId: { _id: string; name: string };
  invitedBy: { _id: string; userName: string };
  createdAt: string;
}
