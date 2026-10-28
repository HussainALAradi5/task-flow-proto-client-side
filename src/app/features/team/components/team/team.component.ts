import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AlertService } from '../../../../core/services/alert.service';
import { TeamService } from '../../services/team';
import { TeamInvitation } from '../../../../core/interfaces/team-invitation.interface';
import { Team } from '../../../../core/interfaces/team.interface';
import { PaginationMeta } from '../../../../core/interfaces/pagination-meta.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { GenericPaginationComponent } from '../../../../shared/components/generic-pagination/generic-pagination.component';
import { GenericLoadingComponent } from '../../../../shared/components/generic-loading/generic-loading.component';
import { TeamChatComponent } from '../team-chat/team-chat.component';
import { ProjectService } from '../../../board/services/project';
import { Project } from '../../../../core/interfaces/project.interface';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ViewMode } from '../../../../core/enums/view-mode.enum';
import { InvitationDecision } from '../../../../core/enums/invitation-decision.enum';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink, GenericButtonComponent, GenericDialogComponent, GenericPaginationComponent, GenericLoadingComponent, TeamChatComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your teams</p>
        </div>
        @if (auth.isAdmin() || auth.isLeader()) {
        <app-generic-button (onClick)="openCreateDialog()">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Team
        </app-generic-button>
        }
      </div>

      <div class="mb-5 flex justify-end">
        <div class="inline-flex rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800" aria-label="Team view">
          <button type="button" (click)="setViewMode(ViewMode.Grid)" [attr.aria-pressed]="viewMode() === ViewMode.Grid" [class]="viewMode() === ViewMode.Grid ? 'rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white dark:bg-blue-600' : 'rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300'">Grid</button>
          <button type="button" (click)="setViewMode(ViewMode.List)" [attr.aria-pressed]="viewMode() === ViewMode.List" [class]="viewMode() === ViewMode.List ? 'rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white dark:bg-blue-600' : 'rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300'">List</button>
        </div>
      </div>

      @if (invitations().length) {
        <section class="mb-8 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5" aria-label="Team invitations">
          <h2 class="font-semibold text-gray-900 dark:text-white mb-1">Your invitations ({{ invitations().length }})</h2>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">Accept to join the team and its boards, or decline.</p>
          @for (invitation of invitations(); track invitation._id) {
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-t border-blue-200 dark:border-blue-800">
              <div><p class="font-medium text-gray-900 dark:text-white">{{ invitation.teamId.name }}</p><p class="text-sm text-gray-600 dark:text-gray-300">Invited by {{ invitation.invitedBy.userName }}</p></div>
              <div class="flex gap-2">
                <button type="button" (click)="respond(invitation, InvitationDecision.Decline)" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">Decline</button>
                <button type="button" (click)="respond(invitation, InvitationDecision.Accept)" class="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Accept</button>
              </div>
            </div>
          }
        </section>
      }
      @if (loading()) {
        <app-generic-loading label="Loading teams" />
      } @else {
        <div [class]="viewMode() === ViewMode.Grid ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'">
          @for (team of teams(); track team._id) {
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ team.name }}</h3>
                <div class="flex gap-2">
                  @if (canManage(team)) {
                  <button (click)="openEditDialog(team)" [attr.aria-label]="'Edit ' + team.name" class="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  }
                  @if (canManage(team)) {
                  <button (click)="confirmDelete(team)" [attr.aria-label]="'Delete ' + team.name" class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  }
                </div>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{{ team.description || 'No description' }}</p>
              <div class="mt-4">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Invited members ({{ team.members?.length || 0 }})</span>
                  @if (canManage(team)) {
                    <button type="button" (click)="openMembers(team)" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Manage</button>
                  }
                </div>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-300 truncate">{{ memberNames(team) }}</p>
              </div>
              <div class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                <div class="flex items-center justify-between gap-2">
                  <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Projects ({{ projectsFor(team._id).length }})</h4>
                  @if (projectsFor(team._id).length > 3) { <a [routerLink]="['/board']" [queryParams]="{teamId: team._id}" class="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">View all</a> }
                </div>
                <ul class="mt-2 space-y-1">
                  @for (project of projectsFor(team._id).slice(0, 3); track project._id) {
                    <li><a [routerLink]="['/board', project.slug]" class="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"><span class="truncate">{{ project.title }}</span><span class="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">Team board</span></a></li>
                  } @empty { <li class="text-sm text-gray-500 dark:text-gray-400">No team boards yet</li> }
                </ul>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-gray-400">Created {{ team.createdAt | date:'mediumDate' }}</span>
                  @if (canChat(team)) { <button type="button" (click)="chatTeam.set(team)" class="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">Team chat</button> }
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 class="text-gray-900 dark:text-white font-medium mb-1">No teams yet</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">Create a team to collaborate with others</p>
              @if (auth.isAdmin() || auth.isLeader()) {
                <app-generic-button (onClick)="openCreateDialog()">Create Team</app-generic-button>
              }
            </div>
          }
        </div>

        @if (pagination() && pagination()!.total > 9) {
          <div class="mt-6">
            <app-generic-pagination [meta]="pagination()!" (onPageChange)="loadTeams($event)" />
          </div>
        }
      }
    </div>

    <app-generic-dialog
      [isOpen]="showDialog()"
      [title]="editingTeam() ? 'Edit Team' : 'New Team'"
      confirmText="Save"
      (onClose)="closeDialog()"
      (onConfirm)="saveTeam()"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            [(ngModel)]="formData.name"
            class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Team name"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            [(ngModel)]="formData.description"
            rows="3"
            class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Optional description"
          ></textarea>
        </div>
      </div>
    </app-generic-dialog>
    @if (chatTeam(); as team) { <app-team-chat [team]="team" (closed)="closeChat()" /> }
    <app-generic-dialog [isOpen]="showMembers()" [title]="'Members · ' + (selectedTeam()?.name || '')" confirmText="Done" (onClose)="closeMembers()" (onConfirm)="closeMembers()">
      <div class="space-y-5">
        <p class="text-sm text-gray-600 dark:text-gray-300">Invite someone with an existing TaskFlow account. They can accept or decline before joining the team and its boards.</p>
        <div class="flex flex-col sm:flex-row gap-2">
          <input type="email" [(ngModel)]="memberEmail" (keydown.enter)="addMember()" placeholder="Member email address" aria-label="Member email address" class="min-w-0 flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          <app-generic-button (onClick)="addMember()">Send invite</app-generic-button>
        </div>
        @if (memberError()) { <p role="alert" class="text-sm text-red-600 dark:text-red-400">{{ memberError() }}</p> }
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          @for (member of selectedTeam()?.members || []; track memberId(member)) {
            <li class="flex items-center justify-between gap-3 py-3">
              <div class="min-w-0">
                <p class="font-medium text-gray-900 dark:text-white truncate">{{ memberName(member) }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ memberEmailOf(member) }}</p>
              </div>
              <button type="button" (click)="removeMember(member)" class="text-sm text-red-600 dark:text-red-400 hover:underline" [attr.aria-label]="'Remove ' + memberName(member)">Remove</button>
            </li>
          } @empty { <li class="py-5 text-sm text-gray-500 dark:text-gray-400">No invited members yet.</li> }
        </ul>
      </div>
    </app-generic-dialog>
  `,
})
export class TeamComponent implements OnInit {
  readonly ViewMode = ViewMode;
  readonly InvitationDecision = InvitationDecision;
  private teamsApi = inject(TeamService);
  private projectsApi = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alert = inject(AlertService);
  auth = inject(AuthService);

  teams = signal<Team[]>([]);
  teamProjects = signal<Project[]>([]);
  viewMode = signal<ViewMode>(ViewMode.Grid);
  invitations = signal<TeamInvitation[]>([]);
  pagination = signal<PaginationMeta | null>(null);
  loading = signal(true);
  showDialog = signal(false);
  editingTeam = signal<Team | null>(null);
  formData = { name: '', description: '' };
  showMembers = signal(false);
  selectedTeam = signal<Team | null>(null);
  memberEmail = '';
  memberError = signal('');
  chatTeam = signal<Team | null>(null);

  private userId(value?: string | Record<string, unknown>): string | undefined {
    return typeof value === 'string' ? value : value?.['_id'] as string | undefined;
  }

  canManage(team: Team): boolean {
    const currentId = this.auth.currentUser()?._id;
    return !!currentId && this.userId(team.createdBy) === currentId;
  }

  canChat(team: Team): boolean {
    const currentId = this.auth.currentUser()?._id;
    return !!currentId && (this.canManage(team) || !!team.members?.some((member) => this.memberId(member) === currentId));
  }

  closeChat(): void {
    this.chatTeam.set(null);
    if (this.route.snapshot.queryParamMap.has('chat')) {
      this.router.navigate([], { relativeTo: this.route, queryParams: { chat: null }, queryParamsHandling: 'merge', replaceUrl: true });
    }
  }

  memberId(member: string | { _id: string }): string { return typeof member === 'string' ? member : member._id; }
  memberName(member: string | { _id: string; userName: string }): string { return typeof member === 'string' ? member : member.userName; }
  memberEmailOf(member: string | { _id: string; email: string }): string { return typeof member === 'string' ? '' : member.email; }
  memberNames(team: Team): string { return team.members?.length ? team.members.map((member) => this.memberName(member)).join(', ') : 'Only the team owner'; }
  projectsFor(teamId: string): Project[] { return this.teamProjects().filter((project) => (typeof project.teamId === 'string' ? project.teamId : project.teamId?._id) === teamId); }
  setViewMode(value: ViewMode): void { this.viewMode.set(value); localStorage.setItem('taskflow-team-view', value); }

  openMembers(team: Team): void { this.selectedTeam.set(team); this.memberEmail = ''; this.memberError.set(''); this.showMembers.set(true); }
  closeMembers(): void { this.showMembers.set(false); this.selectedTeam.set(null); }
  addMember(): void {
    const team = this.selectedTeam();
    if (!team) return;
    const email = this.memberEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.memberError.set('Enter a valid email address.'); return; }
    this.memberError.set('');
    this.teamsApi.addMember(team._id, email).subscribe({
      next: () => { this.memberEmail = ''; this.memberError.set('Invitation sent. They will appear here after accepting.'); },
      error: (error) => this.memberError.set(error.error?.message || 'Could not add member'),
    });
  }
  removeMember(member: string | { _id: string; userName: string }): void {
    const team = this.selectedTeam();
    if (!team) return;
    this.alert.confirm(`Remove ${this.memberName(member)} from ${team.name} and its boards?`, () => {
      this.teamsApi.removeMember(team._id, this.memberId(member)).subscribe({
        next: (response) => { this.selectedTeam.set(response.data); this.loadTeams(1); },
        error: (error) => this.memberError.set(error.error?.message || 'Could not remove member'),
      });
    }, 'Remove member');
  }

  ngOnInit(): void {
    this.viewMode.set(localStorage.getItem('taskflow-team-view') === ViewMode.List ? ViewMode.List : ViewMode.Grid);
    this.loadTeams(1);
    this.loadInvitations();
    this.route.queryParamMap.subscribe((params) => {
      const chatId = params.get('chat');
      if (chatId) this.teamsApi.getAllTeams().subscribe({ next: (teams) => {
        const team = teams.find((item) => item._id === chatId);
        if (team && this.canChat(team)) this.chatTeam.set(team);
      } });
    });
  }

  loadInvitations(): void { this.teamsApi.pendingInvitations().subscribe({ next: (res) => this.invitations.set(res.data) }); }
  respond(invitation: TeamInvitation, decision: InvitationDecision): void {
    this.teamsApi.respondToInvitation(invitation._id, decision).subscribe({ next: () => { this.loadInvitations(); this.loadTeams(1); } });
  }

  loadTeams(page: number): void {
    this.loading.set(true);
    this.teamsApi.getAll(page).subscribe({
      next: (res) => {
        this.teams.set(res.data);
        this.pagination.set(res.pagination);
        this.loading.set(false);
        this.projectsApi.getAllTeamProjects().subscribe({ next: (projects) => this.teamProjects.set(projects) });
      },
      error: () => this.loading.set(false),
    });
  }

  openCreateDialog(): void {
    this.editingTeam.set(null);
    this.formData = { name: '', description: '' };
    this.showDialog.set(true);
  }

  openEditDialog(team: Team): void {
    this.editingTeam.set(team);
    this.formData = { name: team.name, description: team.description || '' };
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingTeam.set(null);
  }

  saveTeam(): void {
    if (this.editingTeam()) {
      this.teamsApi.update(this.editingTeam()!._id, this.formData).subscribe({
        next: () => {
          this.loadTeams(1);
          this.closeDialog();
        },
      });
    } else {
      this.teamsApi.create(this.formData).subscribe({
        next: () => {
          this.loadTeams(1);
          this.closeDialog();
        },
      });
    }
  }

  confirmDelete(team: Team): void {
    this.alert.confirm(
      `Delete "${team.name}"? This action cannot be undone.`,
      () => {
        this.teamsApi.delete(team._id).subscribe({
          next: () => this.loadTeams(1),
        });
      },
      'Delete Team',
    );
  }
}
