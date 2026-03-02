/**
 * Book Search Service - Searches online free book APIs
 * Uses Open Library API (https://openlibrary.org/developers/api)
 */

const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json';

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

/**
 * Search books from Open Library API
 * @param {string} query - Search query (title or author)
 * @returns {Promise<Array>} Array of book objects
 */
export async function searchOnlineBooks(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${OPEN_LIBRARY_API}?q=${encodedQuery}&limit=20&fields=key,title,author_name,first_publish_year,cover_i,subject,isbn,number_of_pages_median`;

    const response = await fetch(url, {
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.docs || data.docs.length === 0) {
      return [];
    }

    return data.docs
      .filter((doc) => doc.title && doc.author_name) // Only return books with title and author
      .slice(0, 20)
      .map((doc) => ({
        title: doc.title || 'Unknown',
        author: doc.author_name?.[0] || 'Unknown Author',
        genre: mapGenre(doc.subject),
        source: 'online',
        externalId: doc.key, // Open Library key for reference
        year: doc.first_publish_year,
        coverId: doc.cover_i,
        isbn: doc.isbn?.[0],
        totalPages: doc.number_of_pages_median || 300, // Default to 300 if not available
      }));
  } catch (error) {
    console.error('Book search error:', error);
    throw new Error(
      error instanceof Error
        ? `Search failed: ${error.message}`
        : 'Failed to search books. Please check your internet connection.'
    );
  }
}
