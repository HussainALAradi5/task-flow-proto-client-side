export enum UserRole {
  ADMIN = 'Admin',
  LEADER = 'Leader',
  MEMBER = 'Member',
}

export const USER_ROLE_OPTIONS = [
  { value: UserRole.ADMIN, label: 'Admin', color: 'bg-purple-400', badge: 'bg-purple-100 text-purple-700' },
  { value: UserRole.LEADER, label: 'Leader', color: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700' },
  { value: UserRole.MEMBER, label: 'Member', color: 'bg-gray-400', badge: 'bg-gray-100 text-gray-700' },
];
