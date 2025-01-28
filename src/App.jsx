import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FavoritesForm from './components/FavoritesForm'
import Recommendation from './components/Recommendation'
import RecommendationCounter from './components/RecommendationCounter'
import { getRecommendation } from './services/deepseekService'
import styles from './App.module.css'
import LoadingAnimation from './components/LoadingAnimation'

function App() {
  const [recommendation, setRecommendation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentFavorites, setCurrentFavorites] = useState(null)
  const [recommendationCount, setRecommendationCount] = useState(15427) // Starting number
  const recommendationRef = useRef(null)

  const handleGetRecommendation = async (favorites, isNewRequest = false) => {
    try {
      setIsLoading(true)
      setError(null)
      setCurrentFavorites(favorites)
      const result = await getRecommendation(favorites, isNewRequest)
      setRecommendation(result)
      setRecommendationCount(prev => prev + 1)
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

  // Scroll to recommendation when it appears
  useEffect(() => {
    if (recommendation && recommendationRef.current) {
      recommendationRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [recommendation])

  return (
    <div className={styles.container}>
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
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
