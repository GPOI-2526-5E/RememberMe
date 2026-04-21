export interface Tombstone {
    _id?: string,
    cemeteryId: string,
    section: string,
    plotNumber: string,
    coordinates: [number, number]
}