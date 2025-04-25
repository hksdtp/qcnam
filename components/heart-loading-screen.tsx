"use client"

import { useEffect, useState } from "react"

interface HeartLoadingScreenProps {
  appName?: string
  onLoadingComplete?: () => void
}

export function HeartLoadingScreen({
  appName = "BÁO CÁO CHI TIÊU",
  onLoadingComplete,
}: HeartLoadingScreenProps) {
  const [isHidden, setIsHidden] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)

  useEffect(() => {
    // Hiển thị loading screen trong khoảng thời gian định trước rồi tắt
    const timer = setTimeout(() => {
      setIsHidden(true)
      
      setTimeout(() => {
        setIsRemoved(true)
        if (onLoadingComplete) {
          onLoadingComplete()
        }
      }, 800)
    }, 6000) // Thời gian dài hơn để hiển thị toàn bộ animation
    
    return () => {
      clearTimeout(timer)
    }
  }, [onLoadingComplete])

  if (isRemoved) {
    return null
  }

  return (
    <div className="love-animation-container">
      <div className="container"></div>
      <svg className="svg-container" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
        <line className="line line--left" x1="10" y1="17" x2="10" y2="183"></line>
        <line className="line line--rght" x1="490" y1="17" x2="490" y2="183"></line>
        <g>
          <path className="lttr lttr--B" d="M42.5,73.9h12.1c5.4,0,8.5,0.3,10.7,1.3c4.1,1.8,6.9,5.9,6.9,11.6c0,4.7-2.8,9.1-6.5,10.3v0.3c1.8,0.8,2.5,1.8,3.1,4.2
          c0.8,3.3,1.5,9,2.8,10.9h-11.9c-0.8-1.6-1.3-5.2-1.8-8.2c-0.8-4.7-1.9-5.6-4.8-5.6h-0.5v13.8h-10.1V73.9z M52.6,89.7h1.5
          c3.8,0,5.6-1,5.6-3.8c0-2.4-1.6-3.6-4.8-3.6h-2.4V89.7z"></path>

          <path className="lttr lttr--A1" d="M92.3,73.9h11l12.2,52.1h-11.9l-1.3-9h-9l-1.5,9h-10.2L92.3,73.9z M100.8,107.1l-3.3-22h-0.2l-3.2,22H100.8z"></path>

          <path className="lttr lttr--O1" d="M123.9,100c0-15.2,11.7-26.9,27.2-26.9s27.2,11.7,27.2,26.9s-11.7,26.9-27.2,26.9S123.9,115.2,123.9,100z M138.7,100
          c0,9.2,5.2,16.5,12.4,16.5c7.2,0,12.3-7.3,12.3-16.5s-5.1-16.5-12.3-16.5C143.9,83.5,138.7,90.8,138.7,100z"></path>

          <path className="lttr lttr--C" d="M185.4,73.9h15.8c13.7,0,19.1,3,19.1,14.7c0,7.3-2.7,10.3-8.7,11.8v0.3c6.8,1.3,10.2,4.3,10.2,12.5
          c0,10.2-6.8,12.7-20.9,12.7h-15.5V73.9z M197.4,94.2h2.3c5.9,0,8.4-0.5,8.4-4.7c0-4.1-2.5-4.8-8.6-4.8h-2.1V94.2z M197.4,116.5h4.1
          c6,0,8.6-0.9,8.6-5.7c0-4.9-2.5-5.9-8.6-5.9h-4.1V116.5z"></path>

          <path className="lttr lttr--A2" d="M233.3,73.9h11l12.2,52.1h-11.9l-1.3-9h-9l-1.5,9h-10.2L233.3,73.9z M241.8,107.1l-3.3-22h-0.2l-3.2,22H241.8z"></path>

          <path className="lttr lttr--O2" d="M264.9,100c0-15.2,11.7-26.9,27.2-26.9s27.2,11.7,27.2,26.9s-11.7,26.9-27.2,26.9S264.9,115.2,264.9,100z M279.7,100
          c0,9.2,5.2,16.5,12.4,16.5c7.2,0,12.3-7.3,12.3-16.5s-5.1-16.5-12.3-16.5C284.9,83.5,279.7,90.8,279.7,100z"></path>

          <path className="lttr lttr--C2" d="M326.4,73.9h15.8c13.7,0,19.1,3,19.1,14.7c0,7.3-2.7,10.3-8.7,11.8v0.3c6.8,1.3,10.2,4.3,10.2,12.5
          c0,10.2-6.8,12.7-20.9,12.7h-15.5V73.9z M338.4,94.2h2.3c5.9,0,8.4-0.5,8.4-4.7c0-4.1-2.5-4.8-8.6-4.8h-2.1V94.2z M338.4,116.5h4.1
          c6,0,8.6-0.9,8.6-5.7c0-4.9-2.5-5.9-8.6-5.9h-4.1V116.5z"></path>

          <path className="lttr lttr--H" d="M372.5,73.9h11.1v20.1h12V73.9h11.1v52.1h-11.1v-21.5h-12v21.5h-11.1V73.9z"></path>

          <path className="lttr lttr--I" d="M412.2,73.9h11.4v52.1h-11.4V73.9z"></path>

          <path className="lttr lttr--T" d="M434.7,73.9h32.3v10.2h-10.6v41.9h-11.1V84.1h-10.6V73.9z"></path>

          <path className="lttr lttr--I2" d="M475.9,73.9h11.4v52.1h-11.4V73.9z"></path>

          <path className="lttr lttr--E" d="M498.1,73.9h31.1v9.7h-20v11.1h16.7v9.5h-16.7v12.2h20.4v9.7h-31.5V73.9z"></path>

          <path className="lttr lttr--U" d="M539.4,101.1V73.9h11.1v26.7c0,10.9,2.3,15.9,11.2,15.9c8.1,0,11.2-4.6,11.2-15.8V73.9h10.6v26.9
          c0,7.8-1.1,13.5-3.8,17.6c-3.5,5.3-10.2,8.4-18.1,8.4c-8.2,0-14.7-3.1-18.3-8.5C540.5,114.2,539.4,108.5,539.4,101.1z"></path>
        </g>
      </svg>
      <div className="mo-container"></div>

      <style jsx global>{`
        .love-animation-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #ffc568;
          opacity: ${isHidden ? 0 : 1};
          transition: opacity 0.8s ease-out;
          pointer-events: ${isHidden ? 'none' : 'auto'};
        }

        .container {
          width: 50rem;
          height: 20rem;
          position: relative;
        }

        .svg-container {
          z-index: 2;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
        }

        .mo-container {
          width: 100%;
          height: 100%;
        }

        .line {
          fill: none;
          stroke: #ffffff;
          stroke-width: 8;
          stroke-linecap: round;
          stroke-miterlimit: 10;
        }

        .line--left {
          animation: lineLeftIn 4.3s ease-in forwards;
        }

        .line--rght {
          animation: lineRghtIn 4.3s ease-in forwards;
        }

        .lttr {
          fill: #E51A22;
          animation: fadeIn 0.1s ease forwards 0s;
          opacity: 0;
          transform-origin: 50% 50%;
        }

        .lttr--B { animation-delay: 0.4s; }
        .lttr--A1 { animation-delay: 0.7s; }
        .lttr--O1 { animation-delay: 1.0s; }
        .lttr--C { animation-delay: 1.3s; }
        .lttr--A2 { animation-delay: 1.6s; }
        .lttr--O2 { animation-delay: 1.9s; }
        .lttr--C2 { animation-delay: 2.2s; }
        .lttr--H { animation-delay: 2.5s; }
        .lttr--I { animation-delay: 2.8s; }
        .lttr--T { animation-delay: 3.1s; }
        .lttr--I2 { animation-delay: 3.4s; }
        .lttr--E { animation-delay: 3.7s; }
        .lttr--U { animation-delay: 4.0s; }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes lineLeftIn {
          0% { stroke-dasharray: 0 166; stroke-dashoffset: 166; }
          30% { stroke-dasharray: 166 0; stroke-dashoffset: 166; }
          60%, 100% { stroke-dasharray: 166 0; stroke-dashoffset: 0; }
        }

        @keyframes lineRghtIn {
          0%, 30% { stroke-dasharray: 0 166; stroke-dashoffset: 166; }
          60% { stroke-dasharray: 166 0; stroke-dashoffset: 166; }
          100% { stroke-dasharray: 166 0; stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
