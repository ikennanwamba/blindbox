import styles from './RecommendationCounter.module.css';

const RecommendationCounter = ({ count }) => {
  return (
    <div className={styles.counter}>
      {count} recommendations generated
    </div>
  );
};

export default RecommendationCounter; 