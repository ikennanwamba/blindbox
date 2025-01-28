const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export const getBookCover = async (title, author) => {
  try {
    const query = `${title} ${author}`.replace(/\s+/g, '+');
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch book cover');
    }

    const data = await response.json();
    
    if (data.items && data.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
      // Replace http with https and get higher quality image
      return data.items[0].volumeInfo.imageLinks.thumbnail
        .replace('http://', 'https://')
        .replace('zoom=1', 'zoom=2');
    }
    
    throw new Error('No cover found');
  } catch (error) {
    console.error('Error fetching book cover:', error);
    return 'https://via.placeholder.com/200x300?text=Cover+Not+Found';
  }
}; 