/**
 * Book Search Service - Searches online free book APIs
 * Uses Open Library API (https://openlibrary.org/developers/api)
 */

const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json';
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Maps Open Library genres/subjects to app genres
 */
const GENRE_MAP = {
  fiction: 'fiction',
  mystery: 'mystery',
  science: 'science',
  technology: 'technology',
  self: 'self-help',
  help: 'self-help',
  biography: 'non-fiction',
  history: 'non-fiction',
  psychology: 'self-help',
  business: 'productivity',
  programming: 'programming',
  'science fiction': 'sci-fi',
  'sci-fi': 'sci-fi',
  scifi: 'sci-fi',
  motivation: 'motivation',
  classic: 'classic',
};

function mapGenre(subjects = []) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return 'other';
  }

  const subject = subjects[0].toLowerCase();
  
  for (const [key, value] of Object.entries(GENRE_MAP)) {
    if (subject.includes(key)) {
      return value;
    }
  }

  return 'other';
}

function createCoverUrl(coverId, size = 'S') {
  if (!coverId) {
    return null;
  }
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

async function fetchWithTimeout(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Search books from Open Library API
 * @param {string} query - Search query (title or author)
 * @returns {Promise<Array>} Array of book objects
 */
export async function searchOnlineBooks(query, { page = 1, pageSize = 15 } = {}) {
  if (!query || query.trim().length === 0) {
    return { books: [], page: 1, hasMore: false };
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Math.min(20, Number(pageSize) || 15));
    const url = `${OPEN_LIBRARY_API}?q=${encodedQuery}&page=${safePage}&limit=${safePageSize}&fields=key,title,author_name,first_publish_year,cover_i,subject,isbn,number_of_pages_median`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.docs || data.docs.length === 0) {
      return { books: [], page: safePage, hasMore: false };
    }

    const books = data.docs
      .filter((doc) => doc.title && doc.author_name) // Only return books with title and author
      .map((doc) => ({
        title: doc.title || 'Unknown',
        author: doc.author_name?.[0] || 'Unknown Author',
        genre: mapGenre(doc.subject),
        source: 'online',
        externalId: doc.key, // Open Library key for reference
        year: doc.first_publish_year,
        coverId: doc.cover_i,
        coverUrl: createCoverUrl(doc.cover_i, 'S'),
        isbn: doc.isbn?.[0],
        totalPages: doc.number_of_pages_median || 300, // Default to 300 if not available
      }));

    return {
      books,
      page: safePage,
      hasMore: books.length === safePageSize,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Search timed out. Please try again.');
    }

    throw new Error(
      error instanceof Error
        ? `Search failed: ${error.message}`
        : 'Failed to search books. Please check your internet connection.'
    );
  }
}
