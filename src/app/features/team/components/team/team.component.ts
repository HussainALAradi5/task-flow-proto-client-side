import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { Team } from '../../../../core/models/team.model';
import { PaginatedResult } from '../../../../core/models/pagination.model';
import { GenericCardComponent } from '../../../../shared/components/generic-card/generic-card.component';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericPaginationComponent } from '../../../../shared/components/generic-pagination/generic-pagination.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [GenericCardComponent, GenericButtonComponent, GenericPaginationComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">My Teams</h1>
        <app-generic-button (onClick)="showCreateDialog.set(true)">
          New Team
        </app-generic-button>
      </div>

      @if (loading()) {
        <div class="text-center py-12">
          <p class="text-gray-500">Loading teams...</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (team of teams(); track team._id) {
            <app-generic-card
              [title]="team.name"
              [subtitle]="team.description || 'No description'"
              [showActions]="true"
              (onEdit)="editTeam(team)"
              (onDelete)="deleteTeam(team)"
            />
          } @empty {
            <div class="col-span-full text-center py-12">
              <p class="text-gray-500">No teams found</p>
            </div>
          }
        </div>

        @if (pagination()) {
          <app-generic-pagination
            [meta]="pagination()!"
            (onPageChange)="loadTeams($event)"
          />
        }
      }
    </div>
  `,
})
export class TeamComponent implements OnInit {
  private api = inject(ApiService);

  teams = signal<Team[]>([]);
  pagination = signal<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  loading = signal(true);
  showCreateDialog = signal(false);

  ngOnInit(): void {
    this.loadTeams(1);
  }

  loadTeams(page: number): void {
    this.loading.set(true);
    this.api.getAll<Team>('teams', { page, limit: 9 }).subscribe({
      next: (res) => {
        this.teams.set(res.data);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  editTeam(team: Team): void {
    console.log('Edit team:', team);
  }

  deleteTeam(team: Team): void {
    console.log('Delete team:', team);
  }
}
