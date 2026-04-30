import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface AuthUser {
  role: 'user' | 'employee';
  email: string;
  fullName?: string;
  username?: string;
  employeeId?: string;
  userId?: string;
  municipalityId?: string | boolean;
  assignedDeceased?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'rememberme_currentUser';
  private readonly API_URL = 'http://localhost:3000/api';

  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as AuthUser;
        this.userSubject.next(user);
      } catch {
        this.userSubject.next(null);
      }
    }
  }

  private saveCurrentUser(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.userSubject.next(user);
    } else {
      localStorage.removeItem(this.USER_KEY);
      this.userSubject.next(null);
    }
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.API_URL}/users`, { email, password })
      .pipe(tap(user => this.saveCurrentUser(user)));
  }

  logout(): void {
    this.saveCurrentUser(null);
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  getCurrentUser(): AuthUser | null {
    return this.userSubject.value;
  }
}
