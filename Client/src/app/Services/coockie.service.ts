import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CookiePreferences {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly COOKIE_CONSENT_KEY = 'remember_me_consent';
  private readonly COOKIE_EXPIRY_DAYS = 5;
  
  private consentSubject = new BehaviorSubject<CookiePreferences | null>(null);
  consent$: Observable<CookiePreferences | null> = this.consentSubject.asObservable();
  
  private showBannerSubject = new BehaviorSubject<boolean>(false);
  showBanner$ = this.showBannerSubject.asObservable();

  constructor() {
    this.loadConsent();
  }

  private loadConsent(): void {
    const saved = localStorage.getItem(this.COOKIE_CONSENT_KEY);
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        this.consentSubject.next(preferences);
        this.showBannerSubject.next(false);
      } catch (e) {
        this.showBannerSubject.next(true);
      }
    } else {
      this.showBannerSubject.next(true);
    }
  }

  setConsent(preferences: CookiePreferences): void {
    localStorage.setItem(this.COOKIE_CONSENT_KEY, JSON.stringify({
      ...preferences,
      lastUpdated: new Date()
    }));
    this.consentSubject.next(preferences);
    this.showBannerSubject.next(false);
    this.applyCookies(preferences);
  }

  private applyCookies(preferences: CookiePreferences): void {
    if (preferences.functional) {
      this.setCookie('functional_enabled', 'true', this.COOKIE_EXPIRY_DAYS);
    } else {
      this.deleteCookie('functional_enabled');
    }

    if (preferences.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }
  }

  private setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (5*60*1000));
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  private enableAnalytics(): void {
    // Placeholder per Google Analytics o simili
    this.setCookie('analytics_enabled', 'true', this.COOKIE_EXPIRY_DAYS);
  }

  private disableAnalytics(): void {
    this.deleteCookie('analytics_enabled');
  }

  getConsent(): CookiePreferences | null {
    return this.consentSubject.value;
  }

  revokeConsent(): void {
    localStorage.removeItem(this.COOKIE_CONSENT_KEY);
    this.consentSubject.next(null);
    this.showBannerSubject.next(true);
  }
}