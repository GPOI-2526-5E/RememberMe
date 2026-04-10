import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CemeteryDetailComponent } from './cemetery-detail/cemetery-detail.component';
import { QrScannerComponent } from './qr-scanner/qr-scanner.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'detail/:id', component: CemeteryDetailComponent },
  { path: 'scan', component: QrScannerComponent },
  { path: '**', redirectTo: '' }
];