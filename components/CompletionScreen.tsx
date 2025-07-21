"use client";

import { CheckCircle, Download, RotateCcw, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CompletionScreenProps {
  attendanceData: {
    dateTime: string;
    attendance: Record<string, string>;
  };
  studentsData: Array<{ name: string; reg: string; image: string }>;
  onRestart: () => void;
}

export default function CompletionScreen({ attendanceData, studentsData, onRestart }: CompletionScreenProps) {
  const presentCount = Object.values(attendanceData.attendance).filter(status => status === 'Present').length;
  const totalCount = Object.values(attendanceData.attendance).length;

  const downloadJSON = () => {
    const dataStr = JSON.stringify(attendanceData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `attendance_${attendanceData.dateTime.replace(/[:\s]/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadExcel = () => {
    // Prepare data for Excel
    const excelData = studentsData.map(student => ({
      'Registration Number': student.reg,
      'Student Name': student.name,
      'Attendance Status': attendanceData.attendance[student.reg] || 'Not Marked',
      'Date & Time': attendanceData.dateTime
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { width: 20 }, // Registration Number
      { width: 25 }, // Student Name
      { width: 18 }, // Attendance Status
      { width: 20 }  // Date & Time
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    // Generate filename
    const fileName = `attendance_${attendanceData.dateTime.replace(/[:\s]/g, '_')}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center border border-gray-100 dark:border-slate-700 mx-4">
        <div className="mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-100 dark:bg-green-900/50 rounded-full animate-ping opacity-75"></div>
            <CheckCircle className="w-20 h-20 sm:w-24 sm:h-24 text-green-500 dark:text-green-400 mx-auto relative z-10 drop-shadow-lg animate-bounce" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-slate-100 mb-3">✅ Attendance Recorded!</h1>
          <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg">Thank you! All students have been marked successfully</p>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-5 sm:p-6 mb-8 border border-gray-100 dark:border-slate-600">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-slate-100 mb-4 sm:mb-6">📊 Summary</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-xl p-3 sm:p-4 shadow-sm border border-green-200 dark:border-green-700">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{presentCount}</div>
              <div className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">Present</div>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 rounded-xl p-3 sm:p-4 shadow-sm border border-red-200 dark:border-red-700">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{totalCount - presentCount}</div>
              <div className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">Absent</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-4 sm:p-5 mb-8 border border-blue-100 dark:border-slate-600">
          <p className="text-sm sm:text-base text-gray-700 dark:text-slate-300">
            <strong className="text-gray-800 dark:text-slate-100">📅 Date & Time:</strong><br />
            {attendanceData.dateTime}
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={downloadJSON}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white py-3 sm:py-4 px-3 sm:px-4 rounded-2xl font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              JSON
            </button>
            
            <button
              onClick={downloadExcel}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white py-3 sm:py-4 px-3 sm:px-4 rounded-2xl font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
              Excel
            </button>
          </div>
          
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 dark:from-slate-600 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-800 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
            Mark New Attendance
          </button>
        </div>
      </div>
    </div>
  );
}