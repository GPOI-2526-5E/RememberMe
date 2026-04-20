import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Memory } from '../Interfaces/Memory';

@Component({
  selector: 'app-memories-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './memories-timeline.component.html',
  styleUrls: ['./memories-timeline.component.scss']
})
export class MemoriesTimelineComponent implements OnInit {
  @Input() deceasedId: string = '';
  @Input() deceasedName: string = '';

  memories: Memory[] = [];
  showForm = false;
  newAuthor = '';
  newMessage = '';
  selectedType: 'memory' | 'message' | 'prayer' = 'memory';

  ngOnInit() {
    this.loadMemories();
  }

  addMemory() {
    if (!this.newAuthor.trim() || !this.newMessage.trim()) {
      return;
    }

    const memory: Memory = {
      id: `memory_${Date.now()}`,
      deceasedId: this.deceasedId,
      author: this.newAuthor,
      message: this.newMessage,
      date: new Date().toISOString(),
      type: this.selectedType
    };

    this.memories.unshift(memory);
    this.saveMemories();
    this.resetForm();
  }

  deleteMemory(id: string) {
    this.memories = this.memories.filter(m => m.id !== id);
    this.saveMemories();
  }

  getIcon(type: string): string {
    switch (type) {
      case 'memory':
        return 'bi-book-half';
      case 'prayer':
        return 'bi-hands-pray';
      case 'message':
        return 'bi-chat-dots';
      default:
        return 'bi-star';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'memory':
        return 'Ricordo';
      case 'prayer':
        return 'Preghiera';
      case 'message':
        return 'Messaggio';
      default:
        return 'Altro';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Oggi';
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;

    return date.toLocaleDateString('it-IT');
  }

  private saveMemories() {
    const key = `memories_${this.deceasedId}`;
    localStorage.setItem(key, JSON.stringify(this.memories));
  }

  private loadMemories() {
    const key = `memories_${this.deceasedId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        this.memories = JSON.parse(saved).sort((a: Memory, b: Memory) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      } catch (e) {
        console.error('Errore nel caricamento dei ricordi:', e);
        this.memories = [];
      }
    }
  }

  private resetForm() {
    this.newAuthor = '';
    this.newMessage = '';
    this.selectedType = 'memory';
    this.showForm = false;
  }
}
