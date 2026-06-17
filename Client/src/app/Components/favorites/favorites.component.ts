import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CookieBannerComponent } from '../cookie-banner/cookie-banner.component';
import { RouterModule, Router } from '@angular/router';
import { NotificationService } from '../../Services/notification.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';

interface Favorite {
  id: string;
  type: 'deceased' | 'cemetery';
  name: string;
  description?: string;
  image?: string;
  addedDate: Date;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, CookieBannerComponent, RouterModule],
  template: `
    <app-navbar></app-navbar>
    <div class="favorites-container pb-32">
      <header class="favorites-header">
        <button class="back-btn mobile-only" (click)="goBack()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1>Preferiti / Scaletta</h1>
        <div class="header-spacer"></div>
      </header>

      <div class="container" *ngIf="isLoggedIn; else loginPrompt">
        <div class="tabs-container">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'deceased'"
            (click)="activeTab = 'deceased'">
            <i class="bi bi-people"></i>
            Defunti Preferiti ({{ deceasedFavorites.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'cemetery'"
            [style.display]="'none'"
            (click)="activeTab = 'cemetery'">
            <i class="bi bi-building"></i>
            Cimiteri Preferiti ({{ cemeteryFavorites.length }})
          </button>
        </div>

        <div class="favorites-content" *ngIf="activeTab === 'deceased'">
          <div *ngIf="deceasedFavorites.length === 0" class="empty-state">
            <i class="bi bi-heart"></i>
            <h3>Nessun defunto preferito</h3>
            <p>Aggiungi defunti ai tuoi preferiti per trovarli velocemente</p>
          </div>

          <div class="favorites-grid">
            <div class="favorite-card glass-card" *ngFor="let fav of deceasedFavorites">
              <div class="card-header">
                <img [src]="fav.image" alt="{{ fav.name }}" *ngIf="fav.image; else placeholder">
                <ng-template #placeholder>
                  <div class="placeholder-image">
                    <i class="bi bi-person"></i>
                  </div>
                </ng-template>
              </div>
              <div class="card-body">
                <h4>{{ fav.name }}</h4>
                <p class="description">{{ fav.description }}</p>
                <div class="card-footer">
                  <small class="date">{{ fav.addedDate | date: 'dd/MM/yyyy' }}</small>
                  <button class="remove-btn" (click)="removeFavorite(fav.id)" title="Rimuovi">
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="favorites-content" *ngIf="activeTab === 'cemetery'">
          <div *ngIf="cemeteryFavorites.length === 0" class="empty-state">
            <i class="bi bi-building"></i>
            <h3>Nessun cimitero preferito</h3>
            <p>Aggiungi cimiteri ai tuoi preferiti per trovarli velocemente</p>
          </div>

          <div class="favorites-grid">
            <div class="favorite-card glass-card" *ngFor="let fav of cemeteryFavorites">
              <div class="card-header">
                <img [src]="fav.image" alt="{{ fav.name }}" *ngIf="fav.image; else placeholder">
                <ng-template #placeholder>
                  <div class="placeholder-image">
                    <i class="bi bi-building"></i>
                  </div>
                </ng-template>
              </div>
              <div class="card-body">
                <h4>{{ fav.name }}</h4>
                <p class="description">{{ fav.description }}</p>
                <div class="card-footer">
                  <small class="date">{{ fav.addedDate | date: 'dd/MM/yyyy' }}</small>
                  <button class="remove-btn" (click)="removeFavorite(fav.id)" title="Rimuovi">
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loginPrompt>
        <div class="container py-5 text-center">
          <div class="login-prompt-card glass-card p-5" style="max-width: 500px; margin: 0 auto; border-radius: 12px; background: var(--glass-bg); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
            <i class="bi bi-lock" style="font-size: 4rem; color: var(--cyan-glow); opacity: 0.8; display: block; margin-bottom: 20px;"></i>
            <h3 class="mb-3">Accedi per visualizzare i preferiti</h3>
            <p class="opacity-70 mb-4">La lista dei defunti preferiti è riservata agli utenti che hanno effettuato l'accesso.</p>
            <button class="btn btn-blue px-4 py-2" (click)="goToLogin()" style="background: linear-gradient(135deg, #00ffff, #0088ff); color: #000; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">Accedi</button>
          </div>
        </div>
      </ng-template>
    </div>
    <app-cookie-banner></app-cookie-banner>
    <app-footer></app-footer>
  `,
  styles: [`
    .favorites-container {
      min-height: 100vh;
      padding: 20px;
      margin-top: 70px;
    }

    .favorites-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
      text-align: center;
    }

    .back-btn {
      display: none;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      color: currentColor;
    }

    @media (max-width: 768px) {
      .back-btn {
        display: block;
      }

      .favorites-header {
        justify-content: flex-start;
        gap: 15px;
      }
    }

    .header-spacer {
      flex: 1;
    }

    h1 {
      font-size: 2rem;
      color: var(--cyan-glow);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .tabs-container {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }

    .tab-btn {
      flex: 1;
      padding: 15px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      color: inherit;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .tab-btn:hover {
      background: rgba(0, 255, 255, 0.1);
    }

    .tab-btn.active {
      background: linear-gradient(135deg, #00ffff, #0088ff);
      color: #000;
      border-color: #00ffff;
    }

    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .favorite-card {
      background: var(--glass-bg);
      border-radius: 12px;
      overflow: hidden;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .favorite-card:hover {
      transform: translateY(-5px);
      border-color: var(--cyan-glow);
    }

    .card-header {
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 136, 255, 0.1));
    }

    .card-header img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      opacity: 0.3;
    }

    .card-body {
      padding: 20px;
    }

    h4 {
      margin: 0 0 10px 0;
      font-size: 1.1rem;
      color: var(--cyan-glow);
    }

    .description {
      margin: 0 0 15px 0;
      opacity: 0.75;
      font-size: 0.9rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .date {
      opacity: 0.6;
      font-size: 0.85rem;
    }

    .remove-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #ff4444;
      transition: all 0.3s ease;
      padding: 0;
    }

    .remove-btn:hover {
      color: #ff6666;
      transform: scale(1.2);
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      opacity: 0.6;
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 20px;
      display: block;
    }

    .empty-state h3 {
      margin: 0 0 10px 0;
    }

    .empty-state p {
      margin: 0;
      opacity: 0.7;
    }
  `]
})
export class FavoritesComponent implements OnInit {
  activeTab: 'deceased' | 'cemetery' = 'deceased';
  deceasedFavorites: Favorite[] = [];
  cemeteryFavorites: Favorite[] = [];
  isLoggedIn = false;

  constructor(
    private location: Location,
    private notification: NotificationService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadFavorites();
    }
  }

  loadFavorites(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.userId) return;

    this.http.get<any[]>(`http://localhost:3000/api/users/${user.userId}/favorites`).subscribe({
      next: (data) => {
        this.deceasedFavorites = data.map(d => ({
          id: d._id,
          type: 'deceased',
          name: d.fullName,
          description: d.biography || 'Nessuna biografia disponibile',
          image: d.deceasedImage,
          addedDate: new Date()
        }));
      },
      error: (err) => {
        console.error('Errore caricamento preferiti:', err);
        this.notification.show('Impossibile caricare i preferiti.', 'error');
      }
    });

    this.cemeteryFavorites = [];
  }

  removeFavorite(id: string): void {
    const user = this.authService.getCurrentUser();
    if (!user?.userId) return;

    this.notification.confirm('Rimuovere questo elemento dai preferiti?', 'Rimuovi').then(confirmed => {
      if (confirmed) {
        this.http.delete(`http://localhost:3000/api/users/${user.userId}/favorites/${id}`).subscribe({
          next: () => {
            this.deceasedFavorites = this.deceasedFavorites.filter(f => f.id !== id);
            this.notification.show('Elemento rimosso dai preferiti', 'success');
          },
          error: (err) => {
            console.error('Errore rimozione:', err);
            this.notification.show('Errore durante la rimozione dei preferiti.', 'error');
          }
        });
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/settings']);
  }

  goBack(): void {
    this.location.back();
  }
}
