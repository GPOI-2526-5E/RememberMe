import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memorial-candle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memorial-candle.component.html',
  styleUrls: ['./memorial-candle.component.scss']
})
export class MemorialCandleComponent implements OnInit {
  @Input() deceasedId: string = '';
  @Input() deceasedName: string = '';

  isCandleOn = false;
  candleCount = 0;
  showMessage = false;

  ngOnInit() {
    this.loadCandleState();
  }

  toggleCandle() {
    const wasOn = this.isCandleOn;
    this.isCandleOn = !this.isCandleOn;

    if (this.isCandleOn && !wasOn) {
      this.candleCount++;
      this.showMessage = true;
      setTimeout(() => {
        this.showMessage = false;
      }, 3000);
    }

    this.saveCandleState();
  }

  private saveCandleState() {
    const key = `candle_${this.deceasedId}`;
    localStorage.setItem(key, JSON.stringify({
      isOn: this.isCandleOn,
      count: this.candleCount,
      lastLit: new Date().toISOString()
    }));
  }

  private loadCandleState() {
    const key = `candle_${this.deceasedId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.isCandleOn = data.isOn;
        this.candleCount = data.count || 0;
      } catch (e) {
        console.error('Errore nel caricamento dello stato della candela:', e);
      }
    }
  }
}
