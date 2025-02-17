import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FavoritesForm from './components/FavoritesForm'
import Recommendation from './components/Recommendation'
import RecommendationCounter from './components/RecommendationCounter'
import { getRecommendation, getMultipleRecommendations } from './services/openaiService'
import { getTotalRecommendations, supabase } from './services/supabaseClient'
import styles from './App.module.css'
import LoadingAnimation from './components/LoadingAnimation'

function App() {
  const [favorites, setFavorites] = useState([
    { id: 1, value: '' },
    { id: 2, value: '' },
    { id: 3, value: '' }
  ]);
  const [recommendations, setRecommendations] = useState([]); // Array of recommendations
  const [loading, setLoading] = useState(false);
  const [recommendationCount, setRecommendationCount] = useState(0)
  const recommendationRef = useRef(null)
  const scrollContainerRef = useRef(null);

  // Load initial count
  useEffect(() => {
    const loadCount = async () => {
      const count = await getTotalRecommendations()
      setRecommendationCount(count)
    }
    loadCount()
  }, [])

  useEffect(() => {
    // Check for URL parameters on load
    const params = new URLSearchParams(window.location.search);
    const fav1 = params.get('fav1');
    const fav2 = params.get('fav2');
    const fav3 = params.get('fav3');
    
    if (fav1 && fav2 && fav3) {
      const favorites = [
        decodeURIComponent(fav1),
        decodeURIComponent(fav2),
        decodeURIComponent(fav3)
      ];
      handleGetRecommendation(favorites);
    }
  }, []);

  const handleInputChange = (id, value) => {
    setFavorites(favorites.map(fav => 
      fav.id === id ? { ...fav, value } : fav
    ));
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const recs = await getMultipleRecommendations(favorites);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
    setLoading(false);
  };

  const handleGetRecommendation = async (favorites, isNewRequest = false) => {
    try {
      setLoading(true)
      const result = await getRecommendation(favorites, isNewRequest)
      setRecommendations(prev => [...prev, result])
      
      // Add logging
      console.log('Getting new total count...')
      const newCount = await getTotalRecommendations()
      console.log('New count received:', newCount)
      setRecommendationCount(newCount)
    } catch (err) {
      console.error('Error:', err)
      throw err;
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (feedbackData) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{
          recommendation_id: feedbackData.recommendationId,
          is_positive: feedbackData.isPositive,
          book_title: feedbackData.title,
          interests: feedbackData.favorites
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; // Adjust as needed
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>BlindBox</h1>
        <p className={styles.subtitle}>AI-powered book recommendations</p>
        <RecommendationCounter count={recommendationCount} />
      </header>

      <main className={styles.main}>
        <div className={styles.inputSection}>
          {favorites.map((favorite) => (
            <div key={favorite.id} className={styles.inputGroup}>
              <label htmlFor={`favorite-${favorite.id}`}>
                Favorite #{favorite.id}
              </label>
              <input
                id={`favorite-${favorite.id}`}
                type="text"
                value={favorite.value}
                onChange={(e) => handleInputChange(favorite.id, e.target.value)}
                placeholder="Enter something you love..."
              />
            </div>
          ))}
        </div>

        <button 
          onClick={generateRecommendations}
          disabled={loading || favorites.some(f => !f.value.trim())}
          className={styles.generateButton}
        >
          {loading ? 'Generating...' : 'Get Recommendations'}
        </button>

        {recommendations.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button 
              className={`${styles.scrollButton} ${styles.scrollLeft}`}
              onClick={() => scroll('left')}
            >
              ←
            </button>
            
            <div className={styles.recommendationsContainer} ref={scrollContainerRef}>
              <div className={styles.recommendationsRow}>
                {recommendations.map((rec, index) => (
                  <Recommendation 
                    key={index}
                    recommendation={rec}
                    onGetAnother={() => {
                      getRecommendation(favorites).then(newRec => {
                        setRecommendations(prev => 
                          prev.map((r, i) => i === index ? newRec : r)
                        );
                      });
                    }}
                    favorites={favorites}
                    onFeedback={handleFeedback}
                  />
                ))}
              </div>
            </div>

            <button 
              className={`${styles.scrollButton} ${styles.scrollRight}`}
              onClick={() => scroll('right')}
            >
              →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
