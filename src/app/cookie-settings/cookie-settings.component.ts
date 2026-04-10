import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CookieService, CookiePreferences } from '../Services/coockie.service';

@Component({
  selector: 'app-cookie-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cookie-settings">
      <div class="settings-container">
        <div class="settings-header">
          <i class="bi bi-cookie"></i>
          <h2>Preferenze cookie</h2>
          <p class="settings-subtitle">Gestisci come trattiamo i tuoi dati</p>
        </div>

        <div class="settings-section">
          <div class="setting-item">
            <div class="setting-info">
              <i class="bi bi-shield-check"></i>
              <div>
                <h4>Cookie funzionali</h4>
                <p>Necessari per il corretto funzionamento dell'app, inclusa la navigazione tra i cimiteri e la ricerca</p>
              </div>
            </div>
            <div class="setting-status">
              <span class="status-badge status-essential">Sempre attivi</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <i class="bi bi-graph-up"></i>
              <div>
                <h4>Cookie analitici</h4>
                <p>Ci aiutano a capire come interagisci con l'app per migliorare l'esperienza</p>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="preferences.analytics" (change)="saveSettings()">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item disabled">
            <div class="setting-info">
              <i class="bi bi-megaphone"></i>
              <div>
                <h4>Cookie di marketing</h4>
                <p>Disabilitati per rispetto della sensibilità del tema. Non utilizziamo mai cookie di tracciamento commerciale</p>
              </div>
            </div>
            <div class="setting-status">
              <span class="status-badge status-disabled">Disabilitati</span>
            </div>
          </div>
        </div>

        <div class="settings-footer">
          <button (click)="resetConsent()" class="btn-reset">
            <i class="bi bi-arrow-counterclockwise"></i>
            Ripristina preferenze
          </button>
          <p class="privacy-note">
            <i class="bi bi-lock"></i>
            I tuoi dati sono al sicuro. Rispettiamo pienamente il GDPR.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    
  `]
})
export class CookieSettingsComponent implements OnInit {
  preferences: CookiePreferences = {
    functional: true,
    analytics: false,
    marketing: false,
    lastUpdated: new Date()
  };

  constructor(private cookieService: CookieService) {}

  ngOnInit(): void {
    const consent = this.cookieService.getConsent();
    if (consent) {
      this.preferences = consent;
    }
  }

  saveSettings(): void {
    this.cookieService.setConsent(this.preferences);
  }

  resetConsent(): void {
    this.preferences = {
      functional: true,
      analytics: false,
      marketing: false,
      lastUpdated: new Date()
    };
    this.cookieService.setConsent(this.preferences);
  }
}