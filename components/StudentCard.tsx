"use client";

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface Student {
  name: string;
  reg: string;
  image: string;
}

interface StudentCardProps {
  student: Student;
  onMark: (status: 'Present' | 'Absent') => void;
  currentIndex: number;
  totalStudents: number;
}

export default function StudentCard({ student, onMark, currentIndex, totalStudents }: StudentCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [pulseType, setPulseType] = useState<'present' | 'absent' | null>(null);

  const handleStart = (clientX: number, clientY: number) => {
    setStartX(clientX);
    setStartY(clientY);
    setIsDragging(true);
    setIsAnimating(false);
    setPulseType(null);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    // Only allow horizontal swipes (prevent vertical scrolling interference)
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    setSwipeOffset(deltaX);

    // Show pulse feedback
    if (deltaX > 50) {
      setPulseType('present');
    } else if (deltaX < -50) {
      setPulseType('absent');
    } else {
      setPulseType(null);
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;

    const threshold = 120;
    setIsDragging(false);

    if (Math.abs(swipeOffset) > threshold) {
      setIsAnimating(true);
      if (swipeOffset > 0) {
        // Animate card off screen right with green pulse
        setPulseType('present');
        setSwipeOffset(400);
        setTimeout(() => {
          onMark('Present');
          resetCard();
        }, 300);
      } else {
        // Animate card off screen left with red pulse
        setPulseType('absent');
        setSwipeOffset(-400);
        setTimeout(() => {
          onMark('Absent');
          resetCard();
        }, 300);
      }
    } else {
      // Snap back to center
      setIsAnimating(true);
      setSwipeOffset(0);
      setPulseType(null);
      setTimeout(() => setIsAnimating(false), 200);
    }
  };

  const resetCard = () => {
    setSwipeOffset(0);
    setIsAnimating(false);
    setIsDragging(false);
    setPulseType(null);
  };

  const handleButtonClick = (status: 'Present' | 'Absent') => {
    setIsAnimating(true);
    setPulseType(status === 'Present' ? 'present' : 'absent');
    setSwipeOffset(status === 'Present' ? 400 : -400);
    setTimeout(() => {
      onMark(status);
      resetCard();
    }, 300);
  };

  const getCardStyle = () => {
    const rotation = swipeOffset * 0.05;
    const opacity = Math.max(0.7, 1 - Math.abs(swipeOffset) / 500);
    const scale = Math.max(0.9, 1 - Math.abs(swipeOffset) / 1000);

    return {
      transform: `translateX(${swipeOffset}px) rotate(${rotation}deg) scale(${scale})`,
      opacity,
      transition: isAnimating ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    };
  };

  const getOverlayOpacity = (type: 'present' | 'absent') => {
    if (pulseType === type) {
      return Math.min(0.85, Math.abs(swipeOffset) / 150);
    }
    return 0;
  };

  return (
    <div className="w-full px-4 sm:px-6 max-w-md mx-auto touch-none">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {currentIndex + 1} of {totalStudents}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(((currentIndex) / totalStudents) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 shadow-inner overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 h-2 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${((currentIndex) / totalStudents) * 100}%` }}
          />
        </div>
      </div>

      <div 
        className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none border border-gray-100 dark:border-slate-700 backdrop-blur-sm"
        style={getCardStyle()}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {/* Present overlay with pulse */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center z-10 backdrop-blur-sm transition-all duration-300 ${
            pulseType === 'present' ? 'animate-pulse' : ''
          }`}
          style={{ opacity: getOverlayOpacity('present') }}
        >
          <div className="text-center">
            <CheckCircle className="w-20 h-20 text-white mx-auto mb-2 drop-shadow-lg animate-bounce" />
            <span className="text-2xl font-bold text-white drop-shadow-lg tracking-wide">PRESENT</span>
          </div>
        </div>

        {/* Absent overlay with pulse */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center z-10 backdrop-blur-sm transition-all duration-300 ${
            pulseType === 'absent' ? 'animate-pulse' : ''
          }`}
          style={{ opacity: getOverlayOpacity('absent') }}
        >
          <div className="text-center">
            <XCircle className="w-20 h-20 text-white mx-auto mb-2 drop-shadow-lg animate-bounce" />
            <span className="text-2xl font-bold text-white drop-shadow-lg tracking-wide">ABSENT</span>
          </div>
        </div>

        {/* Student photo */}
        <div className="h-72 sm:h-80 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20 dark:from-slate-600/20 dark:to-slate-500/20"></div>
          <img 
            src={student.image} 
            alt={student.name}
            className="w-44 h-44 sm:w-52 sm:h-52 rounded-full object-cover shadow-2xl border-4 border-white dark:border-slate-300 relative z-10 ring-4 ring-blue-100 dark:ring-slate-600"
          />
        </div>

        {/* Student info */}
        <div className="p-6 sm:p-8 bg-gradient-to-t from-gray-50 to-white dark:from-slate-800 dark:to-slate-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-slate-100 mb-3 text-center leading-tight">{student.name}</h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-slate-300 font-mono text-center bg-gray-100 dark:bg-slate-700 py-2 px-4 rounded-full border border-gray-200 dark:border-slate-600">{student.reg}</p>
        </div>

        {/* Action buttons */}
        <div className="p-6 sm:p-8 pt-0">
          <div className="flex gap-4 sm:gap-6">
            <button
              onClick={() => handleButtonClick('Absent')}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white py-4 sm:py-5 px-4 sm:px-6 rounded-2xl font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              Absent
            </button>
            <button
              onClick={() => handleButtonClick('Present')}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white py-4 sm:py-5 px-4 sm:px-6 rounded-2xl font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              Present
            </button>
          </div>
        </div>
      </div>

      {/* Swipe hint */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-3 sm:gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-full shadow-lg border border-gray-200 dark:border-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Swipe left for Absent</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Swipe right for Present</span>
          </div>
        </div>
      </div>
    </div>
  );
}