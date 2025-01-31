import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FavoritesForm from './components/FavoritesForm'
import Recommendation from './components/Recommendation'
import RecommendationCounter from './components/RecommendationCounter'
import { getRecommendation } from './services/openaiService'
import { getTotalRecommendations, supabase } from './services/supabaseClient'
import styles from './App.module.css'
import LoadingAnimation from './components/LoadingAnimation'

function App() {
  const [recommendation, setRecommendation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentFavorites, setCurrentFavorites] = useState(null)
  const [recommendationCount, setRecommendationCount] = useState(0)
  const recommendationRef = useRef(null)
  const [theme, setTheme] = useState('light')

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

  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }, []);

  const handleGetRecommendation = async (favorites, isNewRequest = false) => {
    try {
      setIsLoading(true)
      setError(null)
      setCurrentFavorites(favorites)
      const result = await getRecommendation(favorites, isNewRequest)
      setRecommendation(result)
      
      // Add logging
      console.log('Getting new total count...')
      const newCount = await getTotalRecommendations()
      console.log('New count received:', newCount)
      setRecommendationCount(newCount)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to get recommendation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetAnotherRecommendation = async () => {
    if (currentFavorites) {
      await handleGetRecommendation(currentFavorites, true)
    }
  }

  // Update the useEffect to be more specific about when to scroll
  useEffect(() => {
    if (recommendation && !isLoading && recommendationRef.current) {
      recommendationRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [recommendation, isLoading]); // Added isLoading as a dependency

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

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className={styles.container}>
      <button 
        onClick={toggleTheme} 
        className={styles.themeToggle}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <header className={styles.header}>
        <h1>BlindBox</h1>
        <p className={styles.subtitle}>AI-powered book recommendations</p>
        <RecommendationCounter count={recommendationCount} />
      </header>

      <main className={styles.main}>
        <FavoritesForm 
          onSubmit={handleGetRecommendation}
          isLoading={isLoading}
        />
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {!isLoading && recommendation && (
          <div ref={recommendationRef}>
            <Recommendation 
              recommendation={recommendation}
              onGetAnother={handleGetAnotherRecommendation}
              favorites={currentFavorites}
              onFeedback={handleFeedback}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
