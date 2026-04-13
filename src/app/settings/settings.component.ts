import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

interface User {
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // Theme
  currentTheme: 'light' | 'dark' | 'auto' = 'dark';
  
  // User
  isLoggedIn: boolean = false;
  userName: string = '';
  userEmail: string = '';
  userAvatar: string = '';
  isPremium: boolean = false;
  
  // Notifications
  notificationsEnabled: boolean = true;
  
  // Font size
  fontSize: number = 100;
  
  // App info
  appVersion: string = '2.1.0';
  lastUpdate: string = '13 Aprile 2026';
  currentYear: number = new Date().getFullYear();
  
  // Cache
  cacheSize: string = '0 MB';
  
  // Modals
  showLoginModal: boolean = false;
  showRegisterModal: boolean = false;
  
  // Forms
  loginEmail: string = '';
  loginPassword: string = '';
  registerName: string = '';
  registerEmail: string = '';
  registerPassword: string = '';
  registerConfirmPassword: string = '';
  acceptTerms: boolean = false;
  
  constructor(
    private router: Router,
    private location: Location
  ) {
    this.loadSettings();
    this.checkLoginStatus();
    this.calculateCacheSize();
  }
  
  ngOnInit(): void {
    this.applyTheme(this.currentTheme);
    this.listenToSystemTheme();
  }
  
  private loadSettings(): void {
    const settings = localStorage.getItem('appSettings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        this.currentTheme = parsed.theme || 'dark';
        this.selectedLanguage = parsed.language || 'it';
        this.notificationsEnabled = parsed.notifications !== false;
        this.fontSize = parsed.fontSize || 100;
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }
  
  private saveSettings(): void {
    const settings = {
      theme: this.currentTheme,
      language: this.selectedLanguage,
      notifications: this.notificationsEnabled,
      fontSize: this.fontSize
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }
  
  private checkLoginStatus(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.isLoggedIn = true;
        this.userName = userData.name || 'Utente';
        this.userEmail = userData.email || '';
        this.userAvatar = userData.avatar || '';
        this.isPremium = userData.isPremium || false;
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    }
  }
  
  private listenToSystemTheme(): void {
    if (this.currentTheme === 'auto') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.currentTheme === 'auto') {
          document.body.classList.toggle('dark-theme', e.matches);
          document.body.classList.toggle('light-theme', !e.matches);
        }
      });
    }
  }
  
  // Navigation
  goBack(): void {
    this.location.back();
  }
  
  goToHome(): void {
    this.router.navigate(['/']);
  }
  
  // Theme Management
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveSettings();
    this.showToast(`Tema ${theme} attivato`);
  }
  
  private applyTheme(theme: string): void {
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');
    
    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(isDark ? 'dark-theme' : 'light-theme');
    } else {
      body.classList.add(`${theme}-theme`);
    }
  }
  
  // Language
  changeLanguage(): void {
    this.saveSettings();
    this.showToast(`Lingua cambiata in ${this.getLanguageName(this.selectedLanguage)}`);
    // Qui puoi integrare una libreria come ngx-translate
  }
  
  private getLanguageName(code: string): string {
    const languages: { [key: string]: string } = {
      'it': 'Italiano',
      'en': 'English',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch'
    };
    return languages[code] || code;
  }
  
  // Notifications
  toggleNotifications(): void {
    if (this.notificationsEnabled) {
      this.requestNotificationPermission();
    }
    this.saveSettings();
    this.showToast(this.notificationsEnabled ? 'Notifiche attivate' : 'Notifiche disattivate');
  }
  
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        this.notificationsEnabled = false;
        this.showToast('Permesso notifiche negato', 'warning');
      }
    }
  }
  
  // Font Size
  increaseFontSize(): void {
    if (this.fontSize < 150) {
      this.fontSize += 10;
      this.applyFontSize();
      this.saveSettings();
    }
  }
  
  decreaseFontSize(): void {
    if (this.fontSize > 80) {
      this.fontSize -= 10;
      this.applyFontSize();
      this.saveSettings();
    }
  }
  
  private applyFontSize(): void {
    document.documentElement.style.fontSize = `${this.fontSize}%`;
  }
  
  // Cache Management
  calculateCacheSize(): void {
    // Simula il calcolo della cache
    const randomSize = (Math.random() * 100 + 10).toFixed(1);
    this.cacheSize = `${randomSize} MB`;
  }
  
  clearCache(): void {
    if (confirm('Sei sicuro di voler cancellare la cache? Questa azione non può essere annullata.')) {
      // Simula la pulizia della cache
      setTimeout(() => {
        this.cacheSize = '0 MB';
        this.showToast('Cache cancellata con successo', 'success');
        
        // Pulisci localStorage tranne le impostazioni utente
        const settings = localStorage.getItem('appSettings');
        const user = localStorage.getItem('currentUser');
        localStorage.clear();
        if (settings) localStorage.setItem('appSettings', settings);
        if (user) localStorage.setItem('currentUser', user);
      }, 1000);
    }
  }
  
  // Auth Methods
  openLogin(): void {
    this.showLoginModal = true;
    this.showRegisterModal = false;
  }
  
  openRegister(): void {
    this.showRegisterModal = true;
    this.showLoginModal = false;
  }
  
  closeModal(): void {
    this.showLoginModal = false;
    this.showRegisterModal = false;
    this.resetForms();
  }
  
  switchToRegister(): void {
    this.openRegister();
  }
  
  switchToLogin(): void {
    this.openLogin();
  }
  
  handleLogin(event: Event): void {
    event.preventDefault();
    
    if (!this.loginEmail || !this.loginPassword) {
      this.showToast('Inserisci email e password', 'warning');
      return;
    }
    
    // Simula login
    setTimeout(() => {
      this.isLoggedIn = true;
      this.userName = this.loginEmail.split('@')[0];
      this.userEmail = this.loginEmail;
      this.isPremium = false;
      
      const userData = {
        name: this.userName,
        email: this.userEmail,
        isPremium: this.isPremium
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      this.closeModal();
      this.showToast('Login effettuato con successo', 'success');
    }, 1000);
  }
  
  handleRegister(event: Event): void {
    event.preventDefault();
    
    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      this.showToast('Compila tutti i campi', 'warning');
      return;
    }
    
    if (this.registerPassword !== this.registerConfirmPassword) {
      this.showToast('Le password non coincidono', 'warning');
      return;
    }
    
    if (!this.acceptTerms) {
      this.showToast('Devi accettare i termini di servizio', 'warning');
      return;
    }
    
    // Simula registrazione
    setTimeout(() => {
      this.isLoggedIn = true;
      this.userName = this.registerName;
      this.userEmail = this.registerEmail;
      this.isPremium = false;
      
      const userData = {
        name: this.userName,
        email: this.userEmail,
        isPremium: this.isPremium
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      this.closeModal();
      this.showToast('Registrazione completata con successo', 'success');
    }, 1000);
  }
  
  logout(): void {
    if (confirm('Sei sicuro di voler uscire?')) {
      this.isLoggedIn = false;
      this.userName = '';
      this.userEmail = '';
      this.userAvatar = '';
      this.isPremium = false;
      localStorage.removeItem('currentUser');
      this.showToast('Logout effettuato', 'info');
    }
  }
  
  private resetForms(): void {
    this.loginEmail = '';
    this.loginPassword = '';
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';
    this.registerConfirmPassword = '';
    this.acceptTerms = false;
  }
  
  // Legal & Privacy
  openPrivacyPolicy(): void {
    window.open('https://example.com/privacy', '_blank');
  }
  
  openTermsOfService(): void {
    window.open('https://example.com/terms', '_blank');
  }
  
  // Contact & Support
  contactSupport(method: 'email' | 'whatsapp'): void {
    if (method === 'email') {
      window.location.href = 'mailto:support@example.com?subject=Supporto App';
    } else if (method === 'whatsapp') {
      window.open('https://wa.me/391234567890', '_blank');
    }
  }
  
  openFAQ(): void {
    window.open('https://example.com/faq', '_blank');
  }
  
  reportProblem(): void {
    const subject = encodeURIComponent('Segnalazione Problema');
    const body = encodeURIComponent('Descrivi il problema riscontrato:\n\n');
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
  }
  
  // App Info
  checkForUpdates(): void {
    this.showToast('Verifica aggiornamenti in corso...', 'info');
    
    setTimeout(() => {
      this.showToast('Hai già la versione più recente!', 'success');
    }, 2000);
  }
  
  rateApp(): void {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open('https://apps.apple.com/app/id123456789', '_blank');
    } else if (isAndroid) {
      window.open('https://play.google.com/store/apps/details?id=com.example.app', '_blank');
    } else {
      window.open('https://example.com/rate', '_blank');
    }
  }
  
  // Social Media
  openSocial(platform: string, event: Event): void {
    event.preventDefault();
    
    const urls: { [key: string]: string } = {
      'twitter': 'https://twitter.com/example',
      'instagram': 'https://instagram.com/example',
      'github': 'https://github.com/example',
      'discord': 'https://discord.gg/example'
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  }
  
  // Utility
  private showToast(message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info'): void {
    // Crea elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: ${this.getToastColor(type)};
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideUp 0.3s ease;
      max-width: 90%;
      text-align: center;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
  
  private getToastColor(type: string): string {
    const colors: { [key: string]: string } = {
      'success': '#4caf50',
      'warning': '#ff9800',
      'info': '#00d4ff',
      'error': '#f44336'
    };
    return colors[type] || colors.['info'];
  }
}

// Aggiungi le animazioni toast dinamicamente
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
  
  @keyframes slideDown {
    from {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    to {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
  }
`;
document.head.appendChild(style);