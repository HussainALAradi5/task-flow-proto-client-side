import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { GenericBadgeComponent } from '../../../../shared/components/generic-badge/generic-badge.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, GenericButtonComponent, GenericDialogComponent, GenericBadgeComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  authService = inject(AuthService);
  showEditDialog = signal(false);
  formData = { userName: '', email: '', mobileNumber: '' };

  getRoleBadge(role: string): 'success' | 'warning' | 'danger' | 'info' | 'purple' {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
      Admin: 'purple', Leader: 'info', Member: 'success',
    };
    return map[role] || 'info';
  }

  openEditDialog(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.formData = { userName: user.userName, email: user.email, mobileNumber: user.mobileNumber || '' };
    }
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
  }

  saveProfile(): void {
    this.authService.updateProfile(this.formData).subscribe({
      next: () => this.closeEditDialog(),
    });
  }
}
