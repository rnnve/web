import type { CSSProperties } from "react";
import styles from "./falling-stars.module.css";

const stars = [
  { left: 36, top: -8, delay: -1.2, duration: 9.7, length: 120 },
  { left: 78, top: 2, delay: -5.8, duration: 12.3, length: 170 },
  { left: 108, top: 24, delay: -3.6, duration: 10.9, length: 140 },
  { left: 56, top: 35, delay: -9.1, duration: 14.1, length: 100 },
  { left: 94, top: -12, delay: -6.4, duration: 11.6, length: 160 },
  { left: 22, top: 48, delay: -11.5, duration: 16.7, length: 90 },
  { left: 118, top: 55, delay: -4.3, duration: 15.3, length: 130 },
  { left: 65, top: 12, delay: -13.7, duration: 18.1, length: 150 },
];

export default function FallingStars() {
  return (
    <div className={styles.field} aria-hidden="true">
      {stars.map((star, index) => (
        <span
          key={index}
          className={styles.star}
          style={
            {
              left: `${star.left}%`,
              top: `${star.top}%`,
              "--star-delay": `${star.delay}s`,
              "--star-duration": `${star.duration}s`,
              "--star-length": `${star.length}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
