import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CookieBannerComponent } from '../cookie-banner/cookie-banner.component';
import { FooterComponent } from '../footer/footer.component';
import { QrScannerService } from '../../Services/qr-scanner.service';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CookieBannerComponent, FooterComponent],
  templateUrl: './qr-scanner.component.html'
})
export class QrScannerComponent implements OnInit, OnDestroy {
  scanning = false;
  errorMessage = '';

  constructor(private qrService: QrScannerService, public router: Router) {}

  ngOnInit() {
    this.startScanner();
  }

  startScanner() {
    this.errorMessage = '';

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.errorMessage = 'Il tuo dispositivo o browser non supporta la fotocamera. Usa un altro dispositivo o autorizza la fotocamera.';
      return;
    }

    this.scanning = true;
    this.qrService
      .startScanner('reader', (decodedText) => {
        this.qrService.stopScanner();
        this.router.navigate(['/detail', decodedText]);
      })
      .catch((error) => {
        console.error(error);
        this.scanning = false;
        this.errorMessage =
          error && error.name === 'NotAllowedError'
            ? 'Accesso alla fotocamera negato. Consenti i permessi per continuare.'
            : 'Impossibile avviare la fotocamera. Controlla le impostazioni del dispositivo e riprova.';
      });
  }

  retry() {
    this.startScanner();
  }

  cancel() {
    this.qrService.stopScanner();
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.qrService.stopScanner();
  }
}