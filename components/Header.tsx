import React from 'react';
import { BookOpen, FileQuestion } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-indigo-700 text-white shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Oms BSE Odisha Mock Test</h1>
            <p className="text-indigo-200 text-sm">Class X - General Science (Odia Medium)</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <FileQuestion className="h-5 w-5 text-indigo-200" />
          <span className="font-medium">AI-Powered</span>
        </div>
      </div>
    </header>
  );
};

export default Header;