"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Head from "next/head"

export default function LoadingTestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <h1 className="text-2xl font-bold mb-4">Trang Kiểm Tra Hiệu Ứng Loading</h1>
      
      <div className="loading-container">
        {/* Love Animation HTML */}
        <div className="loading-screen">
          <div className="center-container">
            {/* Heart element */}
            <div className="heart"></div>
            
            {/* Text container */}
            <div className="text-wrapper">
              <div className="text">BÁO CÁO CHI TIÊU</div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .loading-screen {
          position: relative;
          width: 100%;
          height: 400px;
          background: linear-gradient(135deg, #E51A22 0%, #FF9500 100%);
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        
        .center-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .heart {
          width: 60px;
          height: 60px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          margin-bottom: 30px;
          animation: heartBeat 1.8s infinite;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
        }
        
        .text-wrapper {
          margin-top: 10px;
        }
        
        .text {
          color: white;
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 1px;
          animation: textPulse 3s infinite;
          text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        }
        
        /* Burst effect */
        .center-container::before,
        .center-container::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
          animation: burstAnim 3s infinite;
        }
        
        .center-container::before {
          top: 30%;
          left: 30%;
        }
        
        .center-container::after {
          bottom: 30%;
          right: 30%;
          animation-delay: 1.5s;
        }
        
        /* Add particles */
        .loading-screen::before,
        .loading-screen::after {
          content: '';
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          box-shadow: 
            0 0 10px 2px rgba(255, 255, 255, 0.7),
            0 0 20px 4px rgba(255, 255, 255, 0.5),
            0 0 30px 6px rgba(255, 255, 255, 0.3);
          animation: particleAnim 4s linear infinite;
        }
        
        .loading-screen::before {
          top: 20%;
          left: 20%;
        }
        
        .loading-screen::after {
          bottom: 20%;
          right: 20%;
          animation-delay: 2s;
        }
        
        @keyframes heartBeat {
          0%, 100% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.3);
          }
          30% {
            transform: scale(1);
          }
          45% {
            transform: scale(1.2);
          }
          60% {
            transform: scale(1);
          }
        }
        
        @keyframes textPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes burstAnim {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          20% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(3);
            opacity: 1;
          }
          100% {
            transform: scale(6);
            opacity: 0;
          }
        }
        
        @keyframes particleAnim {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        
        .loading-container {
          width: 100%;
          max-width: 500px;
          margin: 20px 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      
      <div className="mt-8">
        <Button>Quay Lại Trang Chính</Button>
      </div>
    </div>
  )
}
