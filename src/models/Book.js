const STATUS_VALUES = ['want_to_read', 'reading', 'finished'];
const SOURCE_VALUES = ['manual', 'online'];
const GENRE_VALUES = [
  'fiction',
  'non-fiction',
  'classic',
  'sci-fi',
  'self-help',
  'technology',
  'productivity',
  'programming',
  'science',
  'mystery',
  'motivation',
  'other',
];

function toSafeString(value, defaultValue = '') {
  return typeof value === 'string' ? value : defaultValue;
}

function toSafeNumber(value, defaultValue = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : defaultValue;
}

function toSafeStatus(value) {
  return STATUS_VALUES.includes(value) ? value : 'want_to_read';
}

function toSafeSource(value) {
  return SOURCE_VALUES.includes(value) ? value : 'manual';
}

function toSafeGenre(value) {
  return GENRE_VALUES.includes(value) ? value : 'other';
}

class Book {
  constructor({
    id = '',
    title = '',
    author = '',
    totalPages = 0,
    currentPage = 0,
    status = 'want_to_read',
    progress = 0,
    genre = 'other',
    source = 'manual',
    createdAt = null,
  } = {}) {
    this.id = toSafeString(id, '');
    this.title = toSafeString(title, '');
    this.author = toSafeString(author, '');
    this.totalPages = Math.max(0, toSafeNumber(totalPages, 0));
    this.currentPage = Math.max(0, toSafeNumber(currentPage, 0));
    this.status = toSafeStatus(status);
    this.progress = Math.max(0, Math.min(100, toSafeNumber(progress, 0)));
    this.genre = toSafeGenre(genre);
    this.source = toSafeSource(source);
    this.createdAt = createdAt ?? null;

    this.applyStatusRules();
  }

  static fromFirestore(doc) {
    const hasDataFn = doc && typeof doc.data === 'function';
    const raw = hasDataFn ? (doc.data() || {}) : (doc || {});
    const idFromDoc = hasDataFn ? doc.id : raw.id;

    return new Book({
      id: toSafeString(raw.id, toSafeString(idFromDoc, '')),
      title: toSafeString(raw.title, ''),
      author: toSafeString(raw.author, ''),
      totalPages: toSafeNumber(raw.totalPages, 0),
      currentPage: toSafeNumber(raw.currentPage, 0),
      status: toSafeStatus(raw.status),
      progress: toSafeNumber(raw.progress, 0),
      genre: toSafeGenre(raw.genre),
      source: toSafeSource(raw.source),
      createdAt: raw.createdAt ?? null,
    });
  }

  toFirestore() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      totalPages: this.totalPages,
      currentPage: this.currentPage,
      status: this.status,
      progress: this.progress,
      genre: this.genre,
      source: this.source,
      createdAt: this.createdAt,
    };
  }

  calculateProgress() {
    if (this.status === 'finished') return 100;
    if (this.status === 'want_to_read') return 0;
    if (this.status === 'reading') {
      if (this.totalPages === 0) return 0;
      return Math.round((this.currentPage / this.totalPages) * 100);
    }
    return 0;
  }

  applyStatusRules() {
    if (this.status === 'finished') {
      this.currentPage = this.totalPages;
      this.progress = 100;
      return;
    }

    if (this.status === 'want_to_read') {
      this.currentPage = 0;
      this.progress = 0;
      return;
    }

    if (this.status === 'reading') {
      if (this.totalPages > 0) {
        this.currentPage = Math.min(this.currentPage, this.totalPages);
      }
      this.progress = this.calculateProgress();
    }
  }
}

export default Book;
