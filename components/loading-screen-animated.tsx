"use client"

import { useEffect, useState, useRef } from "react"
import styles from "./loading-screen-animated.module.css"
import Script from "next/script"

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Hiệu ứng tải MoJS script
  useEffect(() => {
    if (scriptLoaded && containerRef.current) {
      // Khi script đã tải, khởi tạo animation
      initAnimation()
    }
  }, [scriptLoaded])

  // Hàm khởi tạo animation - sẽ chạy khi script đã load
  const initAnimation = () => {
    if (!window.mojs || !containerRef.current) return
    
    const container = containerRef.current
    
    // Tạo burst effect (hiệu ứng nổ)
    const burst1 = new window.mojs.Burst({
      parent: container,
      radius: { 0: 100 },
      count: 10,
      duration: 2000,
      children: {
        shape: 'circle',
        radius: { 8: 0 },
        fill: ['#FF9500', '#E51A22', '#FF4081'],
        strokeWidth: 2,
        duration: 2000,
        delay: 'stagger(100)',
        easing: 'cubic.out'
      }
    })
    
    // Hiệu ứng tim
    const heart = new window.mojs.Shape({
      parent: container,
      shape: 'heart',
      fill: { '#E51A22': '#FF9500' },
      scale: { 0: 1 },
      easing: 'elastic.out',
      duration: 1000,
      y: -20,
      x: 0,
      repeat: 1,
      delay: 500
    })
    
    // Hiệu ứng sóng
    const circle = new window.mojs.Shape({
      parent: container,
      shape: 'circle',
      scale: { 0: 1.5 },
      fill: 'none',
      stroke: '#E51A22',
      strokeWidth: { 20: 0 },
      opacity: { 1: 0 },
      duration: 1500,
      easing: 'cubic.out',
      repeat: 2
    })
    
    // Hiệu ứng phóng to thu nhỏ cho text
    const textAnimation = new window.mojs.Html({
      el: container.querySelector('.'+styles.logoText),
      y: { 0: -30 },
      opacity: { 0: 1 },
      duration: 1000,
      scale: { 0.8: 1 },
      easing: 'elastic.out'
    })
    
    // Chạy tất cả hiệu ứng
    const timeline = new window.mojs.Timeline()
    timeline.add(burst1, heart, circle, textAnimation)
    timeline.play()
  }

  // Hẹn giờ ẩn loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHidden(true)
      
      setTimeout(() => {
        setIsRemoved(true)
        if (onLoadingComplete) {
          onLoadingComplete()
        }
      }, 800)
    }, 4000) // Hiển thị 4 giây
    
    return () => {
      clearTimeout(timer)
    }
  }, [onLoadingComplete])

  if (isRemoved) {
    return null
  }

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mojs/core@1.5.0/dist/mo.umd.min.js"
        onLoad={() => {
          setScriptLoaded(true)
        }}
        strategy="beforeInteractive"
      />
      
      <div className={`${styles.loadingScreen} ${isHidden ? styles.hidden : ""}`} ref={containerRef}>
        <div className={styles.logoContainer}>
          <div className={styles.logoText}>{appName}</div>
        </div>
        
        <div className={styles.animationContainer}></div>
        
        <div className={styles.wipeOverlay} />
      </div>
    </>
  )
}

// Định nghĩa kiểu cho Window
declare global {
  interface Window {
    mojs: any
  }
}
