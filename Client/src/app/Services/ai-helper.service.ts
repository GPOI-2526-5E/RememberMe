import { Injectable } from '@angular/core';
import { Cemetery } from '../Interfaces/Cemetery';
import { Deceased } from '../Interfaces/Deceased';

@Injectable({ providedIn: 'root' })
export class AiHelperService {
  getResponse(question: string, cemetery: Cemetery, deceasedList: Deceased[]): string {
    const q = question.toLowerCase();

    if (q.includes('storia') || q.includes('descrizione') || q.includes('informazioni')) {
      return this.getCemeterySummary(cemetery);
    }

    if (q.includes('posizione') || q.includes('dove') || q.includes('mappa') || q.includes('coordinate')) {
      return this.getLocationReply(cemetery);
    }

    if (q.includes('numero') && q.includes('defunti')) {
      return `Nel cimitero ci sono ${deceasedList.length} defunti registrati. Posso cercare un nome specifico per te.`;
    }

    if (q.includes('defunto') || q.includes('tomba') || q.includes('nome')) {
      const found = this.findDeceasedByQuestion(q, deceasedList);
      if (found) {
        return this.getDeceasedSummary(found, cemetery);
      }
    }

    if (q.includes('messaggio') || q.includes('ricordo') || q.includes('commemorazione')) {
      return 'Ecco un messaggio rispettoso: "In questo luogo di memoria, il tuo ricordo continua a scaldare il silenzio. Ogni vita qui custodita resta viva nel cuore di chi la ama."';
    }

    return `Posso darti informazioni sul cimitero "${cemetery.name}", la sua posizione, i defunti registrati e i loro dettagli. Prova a chiedere: "Dove si trova?", "Quanti defunti ci sono?" o "Parlami di [nome defunto]".`;
  }

  private getCemeterySummary(cemetery: Cemetery): string {
    const location = [cemetery.address, cemetery.city, cemetery.country].filter(Boolean).join(', ');
    const description = cemetery.description ? `${cemetery.description}` : 'Non ci sono dettagli aggiuntivi disponibili al momento.';
    return `Il cimitero "${cemetery.name}" si trova a ${location}. ${description}`;
  }

  private getLocationReply(cemetery: Cemetery): string {
    const { city, country } = cemetery;
    const coords = cemetery.location?.coordinates ? `${cemetery.location.coordinates[1]}, ${cemetery.location.coordinates[0]}` : 'coordinate non disponibili';
    return `Il cimitero è visualizzato sulla mappa con la sua posizione esatta. Si trova a ${city || 'una località sconosciuta'}${country ? `, ${country}` : ''} (lat/lng: ${coords}).`;
  }

  private findDeceasedByQuestion(question: string, deceasedList: Deceased[]): Deceased | null {
    const normalized = question.replace(/[^a-z0-9àèéìòù\s]/gi, '');
    return deceasedList.find((deceased) => {
      const name = deceased.fullName.toLowerCase();
      return normalized.includes(name.toLowerCase()) || name.split(' ').some(part => normalized.includes(part));
    }) || null;
  }

  private getDeceasedSummary(deceased: Deceased, cemetery: Cemetery): string {
    const life = `${deceased.birthDate || '?'} – ${deceased.deathDate || '?'}`;
    const tomb = deceased.graveId ? `tomba ${deceased.graveId}` : 'tomba non specificata';
    const desc = deceased.biography ? `${deceased.biography}` : 'Nessuna descrizione aggiuntiva disponibile.';
    return `Ho trovato ${deceased.fullName}, sepolto/a nel cimitero ${cemetery.name}. Periodo di vita: ${life}, ${tomb}. ${desc}`;
  }
}


