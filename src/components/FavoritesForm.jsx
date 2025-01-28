import { useState } from 'react';
import styles from './FavoritesForm.module.css';

const FavoritesForm = ({ onSubmit, isLoading }) => {
  const [favorites, setFavorites] = useState(['', '', '']);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (favorites.every(fav => fav.trim())) {
      onSubmit(favorites);
    }
  };

  const handleInputChange = (index, value) => {
    const newFavorites = [...favorites];
    newFavorites[index] = value;
    setFavorites(newFavorites);
  };

  return (
    <div className={styles.formContainer}>
      <h2>Tell us 3 things you love</h2>
      <p>We'll recommend the perfect book for you!</p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {favorites.map((favorite, index) => (
          <div key={index} className={styles.inputGroup}>
            <label htmlFor={`favorite-${index + 1}`}>
              Favorite #{index + 1}
            </label>
            <input
              id={`favorite-${index + 1}`}
              type="text"
              value={favorite}
              onChange={(e) => handleInputChange(index, e.target.value)}
              placeholder="Enter something you love..."
              required
              disabled={isLoading}
              className={styles.input}
            />
          </div>
        ))}
        
        <button 
          type="submit" 
          disabled={isLoading || !favorites.every(fav => fav.trim())}
          className={`${styles.button} ${isLoading ? styles.loading : ''}`}
        >
          {isLoading ? 'Finding your perfect book...' : 'Get Recommendation'}
        </button>
      </form>
    </div>
  );
};

export default FavoritesForm;
