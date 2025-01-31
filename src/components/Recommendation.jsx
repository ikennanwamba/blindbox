import { useState, useEffect } from 'react';
import { getBookCover } from '../services/bookCoverService';
import styles from './Recommendation.module.css';

const Recommendation = ({ recommendation, onGetAnother, favorites, onFeedback }) => {
  const [coverUrl, setCoverUrl] = useState(null);
  const [isLoadingCover, setIsLoadingCover] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

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

  const generateShareUrl = () => {
    const params = new URLSearchParams();
    favorites.forEach((fav, index) => {
      params.append(`fav${index + 1}`, encodeURIComponent(fav));
    });
    return `${window.location.origin}?${params.toString()}`;
  };

  const generateShareText = () => {
    return `Check out this book recommendation from BlindBox based on: ${favorites.join(', ')}! Book: "${title}" by ${author}`;
  };

  const handleShare = async () => {
    const shareUrl = generateShareUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My BlindBox Book Recommendation',
          text: generateShareText(),
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch(console.error);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent(generateShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(generateShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleInstagramShare = () => {
    const shareText = generateShareText();
    const shareUrl = generateShareUrl();
    
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
      alert('Text copied! You can now paste it in your Instagram post or story.');
    }).catch(console.error);
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(generateShareUrl());
    const title = encodeURIComponent('BlindBox Book Recommendation');
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText() + ' ' + generateShareUrl());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleFeedback = async (isPositive) => {
    try {
      await onFeedback({
        recommendationId: recommendation.id,
        isPositive,
        title: recommendation.title,
        favorites
      });
      setFeedbackGiven(true);
      setFeedbackMessage(isPositive ? 
        "Thanks! We'll keep improving our recommendations!" : 
        "Thanks for letting us know. We'll work on better recommendations!");
    } catch (error) {
      console.error('Error saving feedback:', error);
      setFeedbackMessage('Error saving feedback. Please try again.');
    }
  };

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

        {!feedbackGiven ? (
          <div className={styles.feedbackSection}>
            <h4>Did we nail it?</h4>
            <div className={styles.feedbackButtons}>
              <button 
                onClick={() => handleFeedback(true)}
                className={`${styles.feedbackButton} ${styles.feedbackYes}`}
              >
                Yes! 👍
              </button>
              <button 
                onClick={() => handleFeedback(false)}
                className={`${styles.feedbackButton} ${styles.feedbackNo}`}
              >
                Not quite 👎
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.feedbackMessage}>
            {feedbackMessage}
          </div>
        )}

        <div className={styles.buttons}>
          <button onClick={handleShare} className={styles.shareButton}>
            Share This Recommendation
          </button>
        </div>

        <div className={styles.shareSection}>
          <h4>Share this recommendation:</h4>
          <div className={styles.shareButtons}>
            <button onClick={handleShare} className={`${styles.shareButton} ${styles.shareCopy}`}>
              Copy Link
            </button>
            <button onClick={handleTwitterShare} className={`${styles.shareButton} ${styles.shareTwitter}`}>
              X
            </button>
            <button onClick={handleFacebookShare} className={`${styles.shareButton} ${styles.shareFacebook}`}>
              Facebook
            </button>
            <button onClick={handleInstagramShare} className={`${styles.shareButton} ${styles.shareInstagram}`}>
              Instagram
            </button>
            <button onClick={handleLinkedInShare} className={`${styles.shareButton} ${styles.shareLinkedIn}`}>
              LinkedIn
            </button>
            <button onClick={handleWhatsAppShare} className={`${styles.shareButton} ${styles.shareWhatsApp}`}>
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendation;
