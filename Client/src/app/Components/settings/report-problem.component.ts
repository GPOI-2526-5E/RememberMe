import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../Services/notification.service';
import { EmailService } from '../../Services/email.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-report-problem',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './report-problem.component.html',
  styleUrls: ['./report-problem.component.scss']
})
export class ReportProblemComponent {
  subject = '';
  message = '';
  email = '';
  submitting = false;

  constructor(private notification: NotificationService, private emailService: EmailService) {}

  submit() {
    if (!this.subject.trim() || !this.message.trim()) {
      this.notification.show('Compila oggetto e descrizione.', 'warning');
      return;
    }
    this.submitting = true;

    this.emailService.sendReportEmail(
      this.subject.trim(),
      this.message.trim(),
      this.email.trim()
    )
      .then(() => {
        this.notification.show('Segnalazione inviata. Grazie.', 'success');
        this.subject = '';
        this.message = '';
        this.email = '';
      })
      .catch(() => {
        this.notification.show('Errore invio segnalazione.', 'error');
      })
      .finally(() => {
        this.submitting = false;
      });
  }
}
