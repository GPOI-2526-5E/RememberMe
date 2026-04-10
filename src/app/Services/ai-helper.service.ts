import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AiHelperService {
  getResponse(question: string, cemeteryName: string): string {
    const q = question.toLowerCase();
    if (q.includes('storia') || q.includes('cimitero')) {
      return `Il Cimitero di ${cemeteryName} è uno dei luoghi più carichi di storia e memoria della zona. Vuoi sapere di un defunto specifico?`;
    }
    if (q.includes('percorso') || q.includes('tomba')) {
      return 'Il percorso più breve è evidenziato sulla mappa. Posso aiutarti a scrivere un messaggio di ricordo?';
    }
    if (q.includes('messaggio') || q.includes('ricordo')) {
      return 'Ecco un messaggio suggestivo: "Nella quiete di questo luogo, il tuo ricordo continua a illuminare i nostri cuori. Riposa in pace."';
    }
    return 'Sono qui per aiutarti a ricordare con rispetto. Dimmi cosa cerchi: storia, percorso o un messaggio di commemorazione?';
  }
}
