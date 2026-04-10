import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QrScannerService } from '../Services/qr-scanner.service';
import { BottomBarComponent } from "../bottom-bar/bottom-bar.component";

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, BottomBarComponent],
  templateUrl: './qr-scanner.component.html'
})
export class QrScannerComponent implements OnDestroy {
  constructor(private qrService: QrScannerService, public router: Router) {}

  ngOnInit() {
    this.qrService.startScanner('reader', (decodedText) => {
      // decodedText può essere "c1" o un URL – per semplicità assumiamo ID
      this.qrService.stopScanner();
      this.router.navigate(['/detail', decodedText]);
    });
  }

  ngOnDestroy() {
    this.qrService.stopScanner();
  }
}