export interface User {
    _id?: string,
    username: string,
    email: string,
    pswHash: string,
    createdBy: string,
    assignedDeceased: string[],
    municipalityId: string
}