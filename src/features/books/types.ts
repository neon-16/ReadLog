export type HomeBook = {
  id: string;
  title: string;
  author: string;
  genre: string;
  progress: number;
  status: 'reading' | 'want_to_read' | 'finished' | string;
  totalPages: number;
  currentPage: number;
  pendingSync?: boolean;
};
