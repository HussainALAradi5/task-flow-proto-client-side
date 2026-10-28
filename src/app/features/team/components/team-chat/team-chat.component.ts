import { Component, computed, ElementRef, inject, input, OnDestroy, OnInit, output, signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Team } from '../../../../core/interfaces/team.interface';
import { PaginationMeta } from '../../../../core/interfaces/pagination-meta.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { TeamService } from '../../services/team';
import { TeamMessage } from '../../../../core/interfaces/team-message.interface';
import { TeamChatMember } from '../../../../core/interfaces/team-chat-member.interface';
import { GenericDragDropComponent } from '../../../../shared/components/generic-drag-drop/generic-drag-drop.component';
import { CHAT_ATTACHMENT_ACCEPT, CHAT_ATTACHMENT_EXTENSIONS, CHAT_ATTACHMENT_MAX_BYTES, CHAT_ATTACHMENT_MIMES, CHAT_EMOJIS } from './team-chat.constants';

@Component({
  selector: 'app-team-chat',
  standalone: true,
  imports: [DatePipe, FormsModule, GenericDragDropComponent],
  template: `
    <div class="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" [attr.aria-label]="'Chat for ' + team().name">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="closed.emit()"></div>
      <section class="relative flex h-full w-full max-w-lg flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <header class="flex items-center justify-between border-b border-gray-200 p-5 dark:border-gray-700">
          <div class="min-w-0">
            <h2 class="truncate text-lg font-semibold text-gray-900 dark:text-white">{{ team().name }} chat</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">Visible to this team's owner and accepted members</p>
          </div>
          <button type="button" (click)="closed.emit()" aria-label="Close team chat" class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">✕</button>
        </header>
        <div #messageList class="min-h-0 flex-1 space-y-4 overflow-y-auto p-5" role="log" aria-label="Team messages" aria-live="polite">
          @if (pagination() && currentPage < pagination()!.totalPages) {
            <button type="button" (click)="loadOlder()" class="mx-auto block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">Load older messages</button>
          }
          @if (loading() && !messages().length) { <p class="text-center text-sm text-gray-500">Loading messages…</p> }
          @for (message of messages(); track message._id) {
            <article [class]="isMine(message) ? 'ml-8 rounded-xl border border-blue-100 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20' : 'mr-8 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50'">
              <div class="mb-1 flex items-center justify-between gap-2 text-xs">
                <strong class="truncate text-gray-700 dark:text-gray-200">{{ message.author.userName }}</strong>
                <time class="shrink-0 text-gray-500 dark:text-gray-400" [attr.datetime]="message.createdAt">{{ message.createdAt | date:'short' }}</time>
              </div>
              @if (message.content) { <p class="whitespace-pre-wrap break-words text-sm text-gray-900 dark:text-white">{{ message.content }}</p> }
              @if (message.attachment) {
                @if (isImage(message.attachment)) { <img [src]="message.attachment" [alt]="message.attachmentName || 'Team chat image'" class="mt-2 max-h-72 max-w-full rounded-lg object-contain" /> }
                @else { <button type="button" (click)="download(message.attachment, message.attachmentName)" class="mt-2 rounded-lg border border-blue-300 px-3 py-2 text-left text-sm text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30">📎 {{ message.attachmentName || 'Download attachment' }}</button> }
              }
            </article>
          } @empty {
            @if (!loading()) { <p class="py-12 text-center text-sm text-gray-500 dark:text-gray-400">No messages yet. Start the conversation.</p> }
          }
        </div>
        <footer class="border-t border-gray-200 p-4 dark:border-gray-700">
          @if (attachment()) { <div class="mb-2 flex items-center gap-2 rounded-lg bg-gray-50 p-2 text-sm dark:bg-gray-700"><span class="min-w-0 flex-1 truncate">📎 {{ attachmentName() }}</span><button type="button" (click)="clearAttachment()" class="text-red-600 dark:text-red-400">Remove</button></div> }
          @if (error()) { <p role="alert" class="mb-2 text-sm text-red-600 dark:text-red-400">{{ error() }}</p> }
          @if (mentionMatches().length) {
            <div class="mb-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700" role="listbox" aria-label="Mention a team member">
              @for (member of mentionMatches(); track member._id; let index = $index) {
                <button type="button" role="option" [attr.aria-selected]="index === mentionIndex" (click)="selectMention(member)" [class]="index === mentionIndex ? 'block w-full bg-blue-50 px-3 py-2 text-left text-sm dark:bg-blue-900/30' : 'block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600'">@{{ member.userName }}</button>
              }
            </div>
          }
          <div class="flex items-end gap-2">
            <textarea #chatInput [(ngModel)]="draft" (input)="onDraftInput()" (keydown)="onDraftKeydown($event)" rows="2" maxlength="2000" aria-label="Team message" placeholder="Write a message… Use @ to mention a teammate" class="min-w-0 flex-1 resize-none rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"></textarea>
            <button type="button" (click)="send()" [disabled]="sending()" class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">Send</button>
          </div>
          <div class="mt-2 flex items-start gap-2">
            <app-generic-drag-drop [accept]="attachmentAccept" [compact]="true" (onFilesDropped)="onFilesDropped($event)"><span class="text-xs text-blue-600 dark:text-blue-400">📎 Drop or choose a file</span></app-generic-drag-drop>
            <button type="button" (click)="showEmoji.set(!showEmoji())" [attr.aria-expanded]="showEmoji()" aria-label="Choose emoji" class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600">😊</button>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">One image, GIF, PDF, or text file up to 500 KB per message.</p>
          @if (showEmoji()) { <div class="mt-2 grid grid-cols-8 gap-1 rounded-lg border border-gray-200 p-2 dark:border-gray-600" aria-label="Emoji picker">@for (emoji of emojis; track emoji) { <button type="button" (click)="insertEmoji(emoji)" [attr.aria-label]="'Insert ' + emoji" class="rounded p-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-700">{{ emoji }}</button> }</div> }
        </footer>
      </section>
    </div>
  `,
})
export class TeamChatComponent implements OnInit, OnDestroy {
  team = input.required<Team>();
  closed = output<void>();
  @ViewChild('messageList') messageList?: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') chatInput?: ElementRef<HTMLTextAreaElement>;
  private api = inject(TeamService);
  private auth = inject(AuthService);
  private refreshTimer?: number;

  messages = signal<TeamMessage[]>([]);
  pagination = signal<PaginationMeta | null>(null);
  loading = signal(false);
  sending = signal(false);
  error = signal('');
  attachment = signal('');
  attachmentName = signal('');
  showEmoji = signal(false);
  mentionQuery = signal<string | null>(null);
  mentionedIds = new Set<string>();
  mentionIndex = 0;
  mentionStart = 0;
  readonly emojis = CHAT_EMOJIS;
  readonly attachmentAccept = CHAT_ATTACHMENT_ACCEPT;
  readonly members = computed<TeamChatMember[]>(() => {
    const team = this.team();
    const people = [team.createdBy, ...(team.members || [])];
    return people.filter((person): person is Record<string, unknown> => typeof person === 'object' && !!person)
      .filter((person) => typeof person['_id'] === 'string' && typeof person['userName'] === 'string')
      .map((person) => ({ _id: String(person['_id']), userName: String(person['userName']) }));
  });
  readonly mentionMatches = computed(() => {
    const query = this.mentionQuery()?.toLowerCase() ?? null;
    return query === null ? [] : this.members().filter((member) => member._id !== this.auth.currentUser()?._id && member.userName.toLowerCase().includes(query)).slice(0, 8);
  });
  draft = '';
  currentPage = 0;

  ngOnInit(): void {
    this.loadLatest();
    this.refreshTimer = window.setInterval(() => this.loadLatest(), 15000);
  }

  ngOnDestroy(): void { if (this.refreshTimer) window.clearInterval(this.refreshTimer); }

  isMine(message: TeamMessage): boolean { return message.author._id === this.auth.currentUser()?._id; }

  loadLatest(scroll = false): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.api.getMessages(this.team()._id, 1).subscribe({
      next: (response) => {
        const wasEmpty = this.messages().length === 0;
        const merged = new Map(this.messages().map((item) => [item._id, item]));
        for (const item of response.data) merged.set(item._id, item);
        this.messages.set([...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
        this.pagination.set(response.pagination);
        this.currentPage = Math.max(1, this.currentPage);
        this.loading.set(false);
        this.error.set('');
        if (scroll || wasEmpty) this.scrollToBottom();
      },
      error: (response) => {
        this.loading.set(false);
        if (response.status === 404) { this.messages.set([]); this.error.set('You no longer have access to this team chat.'); }
        else this.error.set('Could not load team messages.');
      },
    });
  }

  loadOlder(): void {
    if (this.loading() || !this.pagination() || this.currentPage >= this.pagination()!.totalPages) return;
    this.loading.set(true);
    const page = this.currentPage + 1;
    this.api.getMessages(this.team()._id, page).subscribe({
      next: (response) => {
        const merged = new Map(this.messages().map((item) => [item._id, item]));
        for (const item of response.data) merged.set(item._id, item);
        this.messages.set([...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
        this.currentPage = page;
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.error.set('Could not load older messages.'); },
    });
  }

  send(): void {
    const content = this.draft.trim();
    if ((!content && !this.attachment()) || this.sending()) return;
    this.sending.set(true);
    const mentions = this.members().filter((member) => this.mentionedIds.has(member._id) && this.hasVisibleMention(content, member.userName)).map((member) => member._id);
    this.api.sendMessage(this.team()._id, { content, attachment: this.attachment() || undefined, attachmentName: this.attachmentName() || undefined, mentions }).subscribe({
      next: () => { this.draft = ''; this.clearAttachment(); this.mentionedIds.clear(); this.mentionQuery.set(null); this.sending.set(false); this.loadLatest(true); },
      error: (error) => { this.sending.set(false); this.error.set(error.error?.message || 'Could not send message.'); },
    });
  }

  onFilesDropped(files: FileList): void {
    const file = files.item(0);
    if (!file) return;
    if (!CHAT_ATTACHMENT_MIMES.includes(file.type) || file.size > CHAT_ATTACHMENT_MAX_BYTES || !CHAT_ATTACHMENT_EXTENSIONS[file.type]?.some((extension) => file.name.toLowerCase().endsWith(extension))) {
      this.error.set('Use a PNG, JPEG, GIF, WebP, PDF, or plain-text file up to 500 KB.'); return;
    }
    if (files.length > 1) this.error.set('One attachment can be sent per message.');
    const reader = new FileReader();
    reader.onload = () => { this.attachment.set(String(reader.result)); this.attachmentName.set(file.name); if (files.length === 1) this.error.set(''); };
    reader.onerror = () => this.error.set('Could not read this file.');
    reader.readAsDataURL(file);
  }

  clearAttachment(): void { this.attachment.set(''); this.attachmentName.set(''); }
  isImage(value: string): boolean { return value.startsWith('data:image/'); }

  download(dataUrl: string, name?: string): void {
    const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
    if (!match) return;
    const binary = atob(match[2]);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: match[1] }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name || 'attachment';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  onDraftInput(): void {
    const caret = this.chatInput?.nativeElement.selectionStart ?? this.draft.length;
    const before = this.draft.slice(0, caret);
    const match = /(?:^|\s)@([^\s@]*)$/.exec(before);
    this.mentionStart = match ? before.length - match[1].length - 1 : 0;
    this.mentionIndex = 0;
    this.mentionQuery.set(match ? match[1] : null);
  }

  onDraftKeydown(event: KeyboardEvent): void {
    const matches = this.mentionMatches();
    if (!matches.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); this.mentionIndex = (this.mentionIndex + 1) % matches.length; }
    if (event.key === 'ArrowUp') { event.preventDefault(); this.mentionIndex = (this.mentionIndex + matches.length - 1) % matches.length; }
    if (event.key === 'Enter') { event.preventDefault(); this.selectMention(matches[this.mentionIndex]); }
    if (event.key === 'Escape') this.mentionQuery.set(null);
  }

  selectMention(member: TeamChatMember): void {
    const caret = this.chatInput?.nativeElement.selectionStart ?? this.draft.length;
    const replacement = `@${member.userName} `;
    this.draft = this.draft.slice(0, this.mentionStart) + replacement + this.draft.slice(caret);
    this.mentionedIds.add(member._id);
    this.mentionQuery.set(null);
    this.focusDraft(this.mentionStart + replacement.length);
  }

  insertEmoji(emoji: string): void {
    const caret = this.chatInput?.nativeElement.selectionStart ?? this.draft.length;
    this.draft = this.draft.slice(0, caret) + emoji + this.draft.slice(caret);
    this.showEmoji.set(false);
    this.focusDraft(caret + emoji.length);
  }

  private hasVisibleMention(content: string, name: string): boolean {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|\\s)@${escaped}(?=$|\\s|[.,!?;:])`).test(content);
  }

  private focusDraft(caret: number): void {
    requestAnimationFrame(() => { this.chatInput?.nativeElement.focus(); this.chatInput?.nativeElement.setSelectionRange(caret, caret); });
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => { if (this.messageList) this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight; });
  }
}
