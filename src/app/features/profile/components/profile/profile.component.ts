import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { GenericBadgeComponent } from '../../../../shared/components/generic-badge/generic-badge.component';
import { BadgeVariant } from '../../../../core/enums/ui-control.enum';
import { UserRole } from '../../../../core/enums/user-role.enum';

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

  getRoleBadge(role: UserRole): BadgeVariant {
    const map: Record<UserRole, BadgeVariant> = {
      [UserRole.ADMIN]: BadgeVariant.Purple,
      [UserRole.LEADER]: BadgeVariant.Info,
      [UserRole.MEMBER]: BadgeVariant.Success,
    };
    return map[role];
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
