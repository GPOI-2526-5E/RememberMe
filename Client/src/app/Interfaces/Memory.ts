export interface Memory {
  id: string;
  deceasedId: string;
  author: string;
  message: string;
  date: string;
  type: 'memory' | 'message' | 'prayer';
}
