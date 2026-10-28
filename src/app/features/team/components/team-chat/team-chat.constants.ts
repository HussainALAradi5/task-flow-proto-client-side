export const CHAT_EMOJIS = ['😀', '😂', '😊', '😍', '👍', '👏', '🎉', '❤️', '🔥', '🚀', '✅', '👀', '🙏', '💡', '📌', '🤝'];
export const CHAT_ATTACHMENT_MIMES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
export const CHAT_ATTACHMENT_ACCEPT = CHAT_ATTACHMENT_MIMES.join(',');
export const CHAT_ATTACHMENT_MAX_BYTES = 500_000;
export const CHAT_ATTACHMENT_EXTENSIONS: Record<string, string[]> = {
  'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/gif': ['.gif'],
  'image/webp': ['.webp'], 'application/pdf': ['.pdf'], 'text/plain': ['.txt'],
};
