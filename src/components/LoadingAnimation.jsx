import styles from './LoadingAnimation.module.css';

const LoadingAnimation = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Finding your perfect book match...</p>
    </div>
  );
};

export default LoadingAnimation; 