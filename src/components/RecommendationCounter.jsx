import styles from './RecommendationCounter.module.css';

const RecommendationCounter = ({ count }) => {
  return (
    <div className={styles.counter}>
      <span className={styles.number}>{count.toLocaleString()}</span>
      <span className={styles.text}>book recommendations generated</span>
    </div>
  );
};

export default RecommendationCounter; 