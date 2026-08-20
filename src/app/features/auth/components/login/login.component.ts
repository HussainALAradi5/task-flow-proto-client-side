import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { GenericButtonComponent } from '../../../../shared/components/generic-button/generic-button.component';
import { GenericPasswordInputComponent } from '../../../../shared/components/generic-password-input/generic-password-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, GenericButtonComponent, GenericPasswordInputComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  identifier = '';
  password = '';
  loading = signal(false);

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.loading.set(true);
    this.authService.login({ identifier: this.identifier, password: this.password }).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: () => this.loading.set(false),
    });
  }
}
