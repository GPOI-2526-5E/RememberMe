export interface Deceased {
  _id?: string;
  fullName: string;
  birthDate: Date;
  deathDate: Date;
  biography: string;
  isFamous: boolean;
  graveId: string;
  cemeteryId?: string;
  assignedUsers: string[];
}
