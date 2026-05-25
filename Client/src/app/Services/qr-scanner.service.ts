import { Injectable } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';

@Injectable({ providedIn: 'root' })
export class QrScannerService {
  private html5QrCode: Html5Qrcode | null = null;

  startScanner(containerId: string, onScan: (decodedText: string) => void) {
    this.html5QrCode = new Html5Qrcode(containerId);
    return this.html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => onScan(decodedText),
      (error) => console.warn(error)
    );
  }

  stopScanner() {
    if (!this.html5QrCode) {
      return Promise.resolve();
    }

    return this.html5QrCode
      .stop()
      .then(() => this.html5QrCode?.clear())
      .catch((error) => {
        console.error(error);
      });
  }
}