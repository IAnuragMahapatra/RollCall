"use client";

import { useState, useEffect } from 'react';
import StudentCard from '@/components/StudentCard';
import CompletionScreen from '@/components/CompletionScreen';

interface Student {
  name: string;
  reg: string;
  image: string;
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{
    dateTime: string;
    attendance: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    // Load students data
    fetch('/students.json')
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error('Failed to load students:', err));
  }, []);

  const handleMarkAttendance = (status: 'Present' | 'Absent') => {
    const currentStudent = students[currentIndex];
    const newAttendance = { ...attendance, [currentStudent.reg]: status };
    setAttendance(newAttendance);

    if (currentIndex < students.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All students marked, save data
      const now = new Date();
      const dateTimeString = now.toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/(\d{2})\/(\d{2})\/(\d{4}),\s/, '$3-$2-$1 ');

      const finalData = {
        dateTime: dateTimeString,
        attendance: newAttendance
      };

      // Save to localStorage
      const existingData = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      existingData.push(finalData);
      localStorage.setItem('attendanceRecords', JSON.stringify(existingData));

      setAttendanceData(finalData);
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAttendance({});
    setIsCompleted(false);
    setAttendanceData(null);
  };

  if (students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  if (isCompleted && attendanceData) {
    return <CompletionScreen attendanceData={attendanceData} studentsData={students} onRestart={handleRestart} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 sm:py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 px-4">
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-3 tracking-tight">
            RollCall
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-slate-200 font-semibold mb-3 tracking-wide">CSE Semester-5</p>
          <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg mb-4">Mark attendance for today's class</p>
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-slate-600">
            <div className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-300">Swipe or tap to mark</span>
          </div>
        </div>

        {/* Current student card */}
        {students[currentIndex] && (
          <StudentCard
            student={students[currentIndex]}
            onMark={handleMarkAttendance}
            currentIndex={currentIndex}
            totalStudents={students.length}
          />
        )}
      </div>
    </div>
  );
}