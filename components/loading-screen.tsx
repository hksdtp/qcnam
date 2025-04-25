"use client"

import { useEffect, useState } from "react"
import styles from "./loading-screen.module.css"

interface LoadingScreenProps {
  appName?: string
  onLoadingComplete?: () => void
}

export function LoadingScreen({
  appName = "BÁO CÁO CHI TIÊU",
  onLoadingComplete,
}: LoadingScreenProps) {
  const [isHidden, setIsHidden] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)

  useEffect(() => {
    // Script chạy hiệu ứng heart animation
    const runAnimation = () => {
      // Đảm bảo DOM đã sẵn sàng
      if (typeof document === 'undefined') return;

      // Lấy các element cần thiết
      const container = document.querySelector(`.${styles.container}`) as HTMLElement;
      const letters = document.querySelectorAll(`.${styles.letter}`) as NodeListOf<HTMLElement>;
      const loveElement = document.querySelector(`.${styles.love}`) as HTMLElement;
      
      if (!container || !letters || !loveElement) return;

      // Hiệu ứng vào cho từng chữ cái
      letters.forEach((letter, index) => {
        setTimeout(() => {
          letter.classList.add(styles.visible);
        }, 100 + (index * 100));
      });

      // Hiệu ứng trái tim
      setTimeout(() => {
        loveElement.classList.add(styles.active);
        
        // Tạo các burst elements
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const burst = document.createElement('div');
            burst.className = styles.burst;
            // Random vị trí trong container
            burst.style.left = `${Math.random() * 80 + 10}%`;
            burst.style.top = `${Math.random() * 80 + 10}%`;
            container.appendChild(burst);
            
            // Xóa burst sau khi animation kết thúc
            setTimeout(() => {
              burst.remove();
            }, 1000);
          }, 300 + (i * 500));
        }
      }, 1200);
    };

    // Chạy animation ngay khi component được mount
    runAnimation();

    // Đặt thời gian để ẩn loading screen
    const timer = setTimeout(() => {
      setIsHidden(true);
      
      setTimeout(() => {
        setIsRemoved(true);
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }, 800);
    }, 4000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [onLoadingComplete]);

  if (isRemoved) {
    return null;
  }

  return (
    <div className={`${styles.loadingScreen} ${isHidden ? styles.hidden : ""}`}>
      <div className={styles.container}>
        {/* Trái tim ở giữa */}
        <div className={styles.love}></div>
        
        {/* Văn bản được chia thành từng chữ cái để animate */}
        <div className={styles.textContainer}>
          {appName.split('').map((letter, index) => (
            <span key={index} className={styles.letter}>
              {letter}
            </span>
          ))}
        </div>
        
        {/* Hiệu ứng particles */}
        <div className={styles.particles}></div>
      </div>
      <div className={styles.wipeOverlay} />
    </div>
  );
}
