import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Notification } from '../../core/interfaces/notification.interface';
import { NotificationKind } from '../../core/enums/notification-kind.enum';
import { NotificationService } from '../../core/services/notification.service';
import { PaginationMeta } from '../../core/interfaces/pagination-meta.interface';
import { GenericPaginationComponent } from '../../shared/components/generic-pagination/generic-pagination.component';

@Component({
  selector: 'app-notifications', standalone: true,
  imports: [DatePipe, GenericPaginationComponent],
  template: `
    <main class="mx-auto max-w-4xl p-4 sm:p-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 class="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1><p class="text-sm text-gray-500 dark:text-gray-400">Invitations, team conversations, and board activity</p></div>
        @if (api.unreadCount()) { <button type="button" (click)="readAll()" class="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">Mark all as read</button> }
      </div>
      <div class="mb-5 flex gap-2" aria-label="Notification filter">
        <button type="button" (click)="setUnread(false)" [attr.aria-pressed]="!unread()" [class]="!unread() ? 'rounded-lg bg-blue-600 px-4 py-2 text-sm text-white' : 'rounded-lg border px-4 py-2 text-sm text-gray-700 dark:text-gray-200'">All</button>
        <button type="button" (click)="setUnread(true)" [attr.aria-pressed]="unread()" [class]="unread() ? 'rounded-lg bg-blue-600 px-4 py-2 text-sm text-white' : 'rounded-lg border px-4 py-2 text-sm text-gray-700 dark:text-gray-200'">Unread ({{ api.unreadCount() }})</button>
      </div>
      @if (error()) { <p role="alert" class="mb-4 text-sm text-red-600">{{ error() }}</p> }
      @if (loading()) { <p class="py-12 text-center text-gray-500">Loading notifications…</p> }
      @else {
        <div class="space-y-2">
          @for (item of items(); track item._id) {
            <article [class]="item.readAt ? 'rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800' : 'rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'">
              <div class="flex items-start gap-3">
                <span [class]="kindClass(item.kind)" class="mt-0.5 shrink-0 rounded-full px-2 py-1 text-xs font-semibold">{{ kindLabel(item.kind) }}</span>
                <div class="min-w-0 flex-1"><h2 class="font-semibold text-gray-900 dark:text-white">{{ item.title }}</h2><p class="mt-1 break-words text-sm text-gray-600 dark:text-gray-300">{{ item.description }}</p><time class="mt-2 block text-xs text-gray-500" [attr.datetime]="item.createdAt">{{ item.createdAt | date:'medium' }}</time></div>
                @if (!item.readAt) { <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread"></span> }
              </div>
              <div class="mt-3 flex gap-3 pl-0 sm:pl-20">
                <button type="button" (click)="open(item)" class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">Open</button>
                @if (!item.readAt) { <button type="button" (click)="markRead(item)" class="text-sm text-gray-600 hover:underline dark:text-gray-300">Mark as read</button> }
              </div>
            </article>
          } @empty { <div class="rounded-xl border border-dashed border-gray-300 py-14 text-center text-gray-500 dark:border-gray-700">{{ unread() ? 'You are all caught up.' : 'No notifications yet.' }}</div> }
        </div>
        @if (pagination() && pagination()!.totalPages > 1) { <div class="mt-6"><app-generic-pagination [meta]="pagination()!" (onPageChange)="load($event)" /></div> }
      }
    </main>
  `,
})
export class NotificationsComponent implements OnInit {
  api = inject(NotificationService);
  private router = inject(Router);
  items = signal<Notification[]>([]);
  pagination = signal<PaginationMeta | null>(null);
  unread = signal(false);
  loading = signal(true);
  error = signal('');
  ngOnInit(): void { this.load(1); }
  kindLabel(kind: NotificationKind): string { return kind === NotificationKind.Invitation ? 'Invite' : kind === NotificationKind.Message ? 'Chat' : 'Activity'; }
  kindClass(kind: NotificationKind): string { return kind === NotificationKind.Invitation ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' : kind === NotificationKind.Message ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'; }
  setUnread(value: boolean): void { this.unread.set(value); this.load(1); }
  load(page: number): void {
    this.loading.set(true);
    this.api.list(page, this.unread()).subscribe({
      next: (response) => { this.items.set(response.data); this.pagination.set(response.pagination); this.loading.set(false); this.error.set(''); },
      error: () => { this.loading.set(false); this.error.set('Could not load notifications.'); },
    });
  }
  markRead(item: Notification): void {
    this.api.read(item._id).subscribe({ next: () => this.load(this.pagination()?.page || 1), error: () => this.error.set('Could not mark this notification as read.') });
  }
  readAll(): void { this.api.readAll().subscribe({ next: () => this.load(1), error: () => this.error.set('Could not mark notifications as read.') }); }
  open(item: Notification): void {
    if (!item.href.startsWith('/') || item.href.startsWith('//')) return;
    if (!item.readAt) this.api.read(item._id).subscribe({ next: () => { this.api.refreshCount(); this.router.navigateByUrl(item.href); }, error: () => this.error.set('Could not open this notification.') });
    else this.router.navigateByUrl(item.href);
  }
}
