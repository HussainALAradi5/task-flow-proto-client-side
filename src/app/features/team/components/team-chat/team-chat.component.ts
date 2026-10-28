import { Component, ElementRef, inject, input, OnDestroy, OnInit, output, signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Team } from '../../../../core/interfaces/team.interface';
import { PaginationMeta } from '../../../../core/interfaces/pagination-meta.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { TeamService } from '../../services/team';
import { TeamMessage } from '../../../../core/interfaces/team-message.interface';

@Component({
  selector: 'app-team-chat',
  standalone: true,
  imports: [DatePipe, FormsModule],
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
              @if (message.attachment) { <img [src]="message.attachment" alt="Team chat image" class="mt-2 max-h-72 max-w-full rounded-lg object-contain" /> }
            </article>
          } @empty {
            @if (!loading()) { <p class="py-12 text-center text-sm text-gray-500 dark:text-gray-400">No messages yet. Start the conversation.</p> }
          }
        </div>
        <footer class="border-t border-gray-200 p-4 dark:border-gray-700">
          @if (attachment()) { <div class="mb-2 flex items-start gap-2"><img [src]="attachment()" alt="Image to send" class="max-h-24 max-w-32 rounded object-contain" /><button type="button" (click)="attachment.set('')" class="text-sm text-red-600">Remove</button></div> }
          @if (error()) { <p role="alert" class="mb-2 text-sm text-red-600 dark:text-red-400">{{ error() }}</p> }
          <div class="flex items-end gap-2">
            <textarea [(ngModel)]="draft" rows="2" maxlength="2000" aria-label="Team message" placeholder="Write a message…" class="min-w-0 flex-1 resize-none rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"></textarea>
            <button type="button" (click)="send()" [disabled]="sending()" class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">Send</button>
          </div>
          <label class="mt-2 inline-block cursor-pointer text-sm text-blue-600 hover:underline dark:text-blue-400">Attach image or GIF<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" (change)="onAttachment($event)" class="sr-only" /></label>
        </footer>
      </section>
    </div>
  `,
})
export class TeamChatComponent implements OnInit, OnDestroy {
  team = input.required<Team>();
  closed = output<void>();
  @ViewChild('messageList') messageList?: ElementRef<HTMLDivElement>;
  private api = inject(TeamService);
  private auth = inject(AuthService);
  private refreshTimer?: number;

  messages = signal<TeamMessage[]>([]);
  pagination = signal<PaginationMeta | null>(null);
  loading = signal(false);
  sending = signal(false);
  error = signal('');
  attachment = signal('');
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
    this.api.sendMessage(this.team()._id, content, this.attachment() || undefined).subscribe({
      next: () => { this.draft = ''; this.attachment.set(''); this.sending.set(false); this.loadLatest(true); },
      error: (error) => { this.sending.set(false); this.error.set(error.error?.message || 'Could not send message.'); },
    });
  }

  onAttachment(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type) || file.size > 500_000) {
      this.error.set('Use a PNG, JPEG, GIF, or WebP image up to 500 KB.'); return;
    }
    const reader = new FileReader();
    reader.onload = () => { this.attachment.set(String(reader.result)); this.error.set(''); };
    reader.onerror = () => this.error.set('Could not read this image.');
    reader.readAsDataURL(file);
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => { if (this.messageList) this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight; });
  }
}
