import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CemeteryDetailComponent } from './cemetery-detail/cemetery-detail.component';
import { QrScannerComponent } from './qr-scanner/qr-scanner.component';
import { SettingsComponent } from './settings/settings.component';
import { MapFullscreenComponent } from './map-fullscreen/map-fullscreen.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'detail/:id', component: CemeteryDetailComponent },
  { path: 'map', component: MapFullscreenComponent },
  { path: 'scan', component: QrScannerComponent },
  { path: 'settings', component: SettingsComponent},
  { path: '**', redirectTo: '' }
];