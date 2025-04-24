"use client"

import { useEffect, useState } from "react"
import styles from "./loading-screen.module.css"

interface LoadingScreenProps {
  appName?: string
  logoColor?: string
  backgroundColor?: string
  onLoadingComplete?: () => void
}

export function LoadingScreen({
  appName = "BÁO CÁO CHI TIÊU",
  logoColor = "white",
  backgroundColor = "#E51A22",
  onLoadingComplete,
}: LoadingScreenProps) {
  const [isHidden, setIsHidden] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)

  useEffect(() => {
    // Đặt hẹn giờ ngay lập tức để đảm bảo màn hình loading sẽ tắt
    const immediateTimer = setTimeout(() => {
      // Thêm class 'hidden' để bắt đầu hiệu ứng fade-out
      setIsHidden(true);
      
      // Sau khi hiệu ứng fade-out kết thúc, ẩn hẳn loading screen
      setTimeout(() => {
        setIsRemoved(true);
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }, 800);
    }, 1500); // Hiển thị loading screen trong 1.5 giây rồi tắt
    
    return () => {
      clearTimeout(immediateTimer);
    };
  }, [onLoadingComplete]);

  if (isRemoved) {
    return null
  }

  return (
    <div className={`${styles.loadingScreen} ${isHidden ? styles.hidden : ""}`} style={{ backgroundColor }}>
      <div className={styles.logoContainer}>
        <div className={styles.logoText}>{appName}</div>
      </div>
      <div className={styles.wipeOverlay} />
    </div>
  )
}
