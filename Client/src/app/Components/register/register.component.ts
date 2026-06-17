import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../Services/auth.service';
import { NotificationService } from '../../Services/notification.service';
import { EmailService } from '../../Services/email.service';
import { environment } from '../../../Environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerEmail = '';
  registerPassword = '';
  registerFullName = '';
  registerUsername = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private notification: NotificationService,
    private emailService: EmailService,
    private router: Router
  ) {}

  handleRegister(event: Event): void {
    event.preventDefault();

    if (!this.registerEmail.trim() || !this.registerPassword.trim() || !this.registerFullName.trim()) {
      this.notification.show('Compila tutti i campi obbligatori prima di procedere.', 'warning');
      return;
    }

    this.isSubmitting = true;
    const payload = {
      username: this.registerUsername.trim() || this.registerFullName.trim(),
      fullName: this.registerFullName.trim(),
      email: this.registerEmail.trim().toLowerCase(),
      password: this.registerPassword,
      createdBy: 'SELF'
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        // Invia email di verifica via EmailJS
        if (res.verificationToken) {
          const verificationUrl = `${environment.frontendUrl}/verify-email/${res.verificationToken}`;
          this.emailService.sendVerificationEmail(payload.email, payload.fullName, verificationUrl)
            .then(() => {
              this.notification.show('Registrazione completata. Controlla la posta per autenticare il tuo account.', 'success');
            })
            .catch(() => {
              this.notification.show('Registrazione completata, ma errore nell\'invio della mail di verifica. Puoi reinviarla dalla pagina di verifica.', 'warning');
            });
        } else {
          this.notification.show('Registrazione completata.', 'success');
        }
        this.isSubmitting = false;
        this.router.navigate(['/verify-email'], { queryParams: { email: payload.email } });
      },
      error: () => {
        this.isSubmitting = false;
        this.notification.show('Registrazione non riuscita. Riprova tra qualche momento.', 'error');
      }
    });
  }
}