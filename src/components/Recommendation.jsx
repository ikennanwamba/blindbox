import { useState, useEffect } from 'react';
import { getBookCover } from '../services/bookCoverService';
import styles from './Recommendation.module.css';

const Recommendation = ({ recommendation, onGetAnother }) => {
  const [coverUrl, setCoverUrl] = useState(null);
  const [isLoadingCover, setIsLoadingCover] = useState(true);

  const {
    title,
    author,
    connections
  } = recommendation;

  useEffect(() => {
    const fetchCover = async () => {
      setIsLoadingCover(true);
      try {
        const url = await getBookCover(title, author);
        setCoverUrl(url);
      } catch (error) {
        console.error('Error loading cover:', error);
        setCoverUrl('https://via.placeholder.com/200x300?text=Cover+Not+Found');
      } finally {
        setIsLoadingCover(false);
      }
    };

    fetchCover();
  }, [title, author]);

  return (
    <div className={styles.container}>
      <div className={styles.mainRecommendation}>
        <div className={styles.recommendationGrid}>
          <div className={styles.bookInfo}>
            <h2 className={styles.bookTitle}>
              <span className={styles.titleText}>{title}</span> 
              <span className={styles.authorText}>by {author}</span>
            </h2>

            <div className={styles.bookCover}>
              {isLoadingCover ? (
                <div className={styles.coverLoading}>Loading cover...</div>
              ) : (
                <img 
                  src={coverUrl}
                  alt={`Cover of ${title}`}
                  className={styles.coverImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200x300?text=Cover+Not+Found';
                  }}
                />
              )}
            </div>

            <button onClick={onGetAnother} className={styles.anotherButton}>
              Get Another Recommendation
            </button>
          </div>

          <div className={styles.whyItFits}>
            <h3>Why it Fits</h3>
            <ul className={styles.connectionsList}>
              {connections.map((connection, index) => (
                <li key={index}>
                  <strong>{connection.topic}:</strong> {connection.explanation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendation;
