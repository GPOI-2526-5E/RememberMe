import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { CemeteryDetailComponent } from './Components/cemetery-detail/cemetery-detail.component';
import { QrScannerComponent } from './Components/qr-scanner/qr-scanner.component';
import { SettingsComponent } from './Components/settings/settings.component';
import { MapFullscreenComponent } from './Components/map-fullscreen/map-fullscreen.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'detail/:id', component: CemeteryDetailComponent },
  { path: 'map', component: MapFullscreenComponent },
  { path: 'scan', component: QrScannerComponent },
  { path: 'settings', component: SettingsComponent},
  { path: '**', redirectTo: '' }
];