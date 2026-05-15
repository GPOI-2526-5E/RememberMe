import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-deceased-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './deceased-profile.component.html',
  styleUrls: ['./deceased-profile.component.scss']
})
export class DeceasedProfileComponent implements OnInit {
  deceased: any = null;
  loading = true;
  private API = 'http://localhost:3000/api';

  // UI state
  activeTab: 'storia' | 'foto' | 'memorie' = 'storia';
  editingStory = false;
  editingEpitaph = false;
  storyDraft = '';
  epitaphDraft = '';
  savingStory = false;
  savingEpitaph = false;
  uploadingPhoto = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${this.API}/Deceaseds/${id}`).subscribe({
        next: (data) => {
          this.deceased = data;
          this.storyDraft = data.story || '';
          this.epitaphDraft = data.biography || '';
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  saveStory(): void {
    this.savingStory = true;
    this.http.patch(`${this.API}/Deceaseds/${this.deceased._id}/story`, { story: this.storyDraft })
      .subscribe({
        next: (updated: any) => {
          this.deceased.story = updated.story;
          this.editingStory = false;
          this.savingStory = false;
        },
        error: () => this.savingStory = false
      });
  }

  saveEpitaph(): void {
    this.savingEpitaph = true;
    this.http.patch(`${this.API}/Deceaseds/${this.deceased._id}/epitaph`, { epitaph: this.epitaphDraft })
      .subscribe({
        next: (updated: any) => {
          this.deceased.epitaph = updated.epitaph;
          this.editingEpitaph = false;
          this.savingEpitaph = false;
        },
        error: () => this.savingEpitaph = false
      });
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingPhoto = true;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.http.post<string[]>(`${this.API}/Deceaseds/${this.deceased._id}/photos`, { photo: base64 })
        .subscribe({
          next: (photos) => {
            this.deceased.images = photos;
            this.uploadingPhoto = false;
          },
          error: () => this.uploadingPhoto = false
        });
    };
    reader.readAsDataURL(file);
  }

  deletePhoto(index: number): void {
    if (!confirm('Eliminare questa foto?')) return;
    this.http.delete<string[]>(`${this.API}/Deceaseds/${this.deceased._id}/photos/${index}`)
      .subscribe(photos => this.deceased.images = photos);
  }

  deleteMemory(memoryId: string): void {
    if (!confirm('Eliminare questo ricordo?')) return;
    this.http.delete<any[]>(`${this.API}/Deceaseds/${this.deceased._id}/memories/${memoryId}`)
      .subscribe(memories => this.deceased.memories = memories);
  }

  getAge(): number {
    return new Date(this.deceased.deathDate).getFullYear() -
           new Date(this.deceased.birthDate).getFullYear();
  }

  getMemoryIcon(type: string): string {
    return type === 'prayer' ? 'bi-heart' : type === 'message' ? 'bi-chat' : 'bi-book';
  }
}