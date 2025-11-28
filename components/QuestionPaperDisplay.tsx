import React, { useRef, useState, useEffect } from 'react';
import { QuestionPaper, SubjectiveQuestion } from '../types';
import { Copy, FileText, CheckCircle, FileDown, ChevronDown, X } from 'lucide-react';

interface Props {
  paper: QuestionPaper;
  onClear: () => void;
}

const QuestionPaperDisplay: React.FC<Props> = ({ paper, onClear }) => {
  const paperRef = useRef<HTMLDivElement>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePrint = () => {
    setIsDownloadOpen(false);
    window.print();
  };

  const handleCopyAll = () => {
    if (paperRef.current) {
      const text = paperRef.current.innerText;
      navigator.clipboard.writeText(text).then(() => {
        alert("Question paper copied to clipboard!");
      });
    }
  };

  const handleDownloadWord = () => {
    setIsDownloadOpen(false);
    if (!paperRef.current) return;

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
xmlns:w='urn:schemas-microsoft-com:office:word' 
xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Question Paper</title></head><body>`;
    
    const footer = "</body></html>";
    // Simple regex to remove some tailwind classes if needed, but Word handles basic HTML okay.
    const sourceHTML = header + paperRef.current.innerHTML + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Oms_BSE_Odisha_PreBoard_${paper.year}_Set${paper.set}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handlePrintOMR = () => {
    setIsDownloadOpen(false);
    const omrWindow = window.open('', '_blank');
    if (omrWindow) {
      omrWindow.document.write(`
        <html>
          <head>
            <title>OMR Answer Sheet - ${paper.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
              .omr-header { border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; }
              .omr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; max-width: 800px; margin: 0 auto; }
              .omr-column { display: flex; flex-direction: column; gap: 10px; }
              .omr-row { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding: 5px 0; }
              .q-num { font-weight: bold; width: 30px; text-align: left; }
              .bubbles { display: flex; gap: 15px; }
              .bubble { width: 25px; height: 25px; border-radius: 50%; border: 1px solid black; display: flex; align-items: center; justify-content: center; font-size: 12px; }
              .set-box { border: 2px solid black; padding: 5px 15px; font-weight: bold; display: inline-block; margin-top: 10px; }
              @media print {
                .no-print { display: none; }
                body { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #333; color: white; border: none; cursor: pointer;">Print / Save as PDF</button>
            </div>
            <div class="omr-header">
              <h1>OMR Answer Sheet</h1>
              <h2>${paper.title} - ${paper.year}</h2>
              <div class="set-box">SET: ${paper.set}</div>
              <div style="display: flex; justify-content: space-around; margin-top: 20px; flex-wrap: wrap; gap: 20px;">
                <span>Name: _______________________</span>
                <span>Roll No: _______________________</span>
                <span>Date: _______________________</span>
              </div>
            </div>
            <div class="omr-grid">
              <div class="omr-column">
                ${Array.from({ length: 25 }).map((_, i) => `
                  <div class="omr-row">
                    <span class="q-num">${i + 1}.</span>
                    <div class="bubbles">
                      <div class="bubble">A</div>
                      <div class="bubble">B</div>
                      <div class="bubble">C</div>
                      <div class="bubble">D</div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="omr-column">
                ${Array.from({ length: 25 }).map((_, i) => `
                  <div class="omr-row">
                    <span class="q-num">${i + 26}.</span>
                    <div class="bubbles">
                      <div class="bubble">A</div>
                      <div class="bubble">B</div>
                      <div class="bubble">C</div>
                      <div class="bubble">D</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div style="margin-top: 40px; text-align: right; padding-right: 50px;">
              <p>_______________________</p>
              <p>Candidate's Signature</p>
            </div>
          </body>
        </html>
      `);
      omrWindow.document.close();
    }
  };

  // Helper to group and render subjective questions with specific numbering
  const renderSubjectiveGroup = (
    questions: SubjectiveQuestion[],
    mainQuestionNumber: number
  ) => {
    // Filter by marks to ensure correct grouping
    const qs = questions.sort((a, b) => a.marks - b.marks); // Sort by marks just in case

    if (qs.length === 0) return null;

    return (
      <div className="mb-6 break-inside-avoid">
        <div className="flex gap-2 font-bold mb-3 text-lg">
            <span>{mainQuestionNumber}.</span>
            <span>Answer the following questions:</span>
        </div>
        <div className="ml-1 pl-2">
            {qs.map((q, idx) => (
                <div key={q.id} className="mb-4 break-inside-avoid">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-2 w-full">
                            <span className="font-semibold min-w-[24px]">{String.fromCharCode(97 + idx)})</span>
                            <span className="font-medium text-lg leading-relaxed">{q.questionText}</span>
                        </div>
                        <span className="font-bold whitespace-nowrap ml-4 text-gray-700">[{q.marks}]</span>
                    </div>
                    {q.hasInternalChoice && q.alternativeQuestionText && (
                    <div className="mt-1">
                        <div className="text-center text-sm font-bold text-gray-500 my-1">- OR -</div>
                        <div className="flex gap-2 ml-0 pl-8">
                            <span className="font-medium text-lg leading-relaxed">{q.alternativeQuestionText}</span>
                        </div>
                    </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    );
  };

  // Filter questions by marks for specific groups
  const phy2Marks = paper.sectionB.physicalScience.filter(q => q.marks === 2);
  const phy3Marks = paper.sectionB.physicalScience.filter(q => q.marks === 3);
  const phy4Marks = paper.sectionB.physicalScience.filter(q => q.marks === 4);

  const life2Marks = paper.sectionB.lifeScience.filter(q => q.marks === 2);
  const life3Marks = paper.sectionB.lifeScience.filter(q => q.marks === 3);
  const life4Marks = paper.sectionB.lifeScience.filter(q => q.marks === 4);

  // Combine MCQs for continuous numbering in Section A
  const allMCQs = [
    ...paper.sectionA.physicalScience.map((q, i) => ({ ...q, displayNum: i + 1 })),
    ...paper.sectionA.lifeScience.map((q, i) => ({ ...q, displayNum: i + 26 }))
  ];

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="bg-white p-4 shadow-md rounded-lg mb-6 flex flex-wrap gap-4 justify-between items-center no-print border border-gray-200">
        <div className="flex flex-wrap gap-2">
           <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded hover:bg-indigo-200 transition-colors"
          >
            <Copy size={18} />
            Copy All
          </button>

          {/* Download Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition-colors"
            >
              <FileDown size={18} />
              Download
              <ChevronDown size={16} />
            </button>
            {isDownloadOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                <button
                  onClick={handleDownloadWord}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  <FileText size={16} /> Word (.doc)
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  <FileDown size={16} /> PDF (Print)
                </button>
                <button
                  onClick={handlePrintOMR}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  <CheckCircle size={16} /> OMR Sheet
                </button>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={onClear}
          className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100 transition-colors border border-red-200"
        >
          <X size={18} />
          Clear All
        </button>
      </div>

      {/* Paper Content */}
      <div ref={paperRef} className="bg-white shadow-xl rounded-lg overflow-hidden mb-8 p-8 md:p-12 max-w-[210mm] mx-auto print:shadow-none print:m-0 print:w-full print:p-0">
        
        {/* Paper Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-8">
          <h2 className="text-3xl font-extrabold mb-2 uppercase tracking-wide">Oms BSE Odisha Mock Test</h2>
          <h3 className="text-xl font-bold">{paper.year}</h3>
          <h3 className="text-xl font-semibold mt-1 uppercase">CLASS - X (HSC) Pre-Board Examination</h3>
          <h4 className="text-lg font-medium mt-1">GENERAL SCIENCE</h4>
          
          <div className="flex justify-between mt-6 text-sm font-bold border-t border-gray-300 pt-2">
            <span>Time: {paper.time}</span>
            <span>Full Marks: {paper.fullMarks}</span>
          </div>
          <div className="mt-4 font-bold border-2 border-black inline-block px-6 py-1 rounded">
            SET: {paper.set}
          </div>
        </div>

        {/* SECTION A */}
        <div className="mb-8">
          <div className="bg-gray-100 text-center py-2 font-bold border-y-2 border-black mb-6 print:bg-gray-100 uppercase tracking-wider">
            Section - A (Objective) - 50 Marks
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            {allMCQs.map((q) => (
              <div key={q.id} className="break-inside-avoid">
                <div className="flex gap-2">
                  <span className="font-bold min-w-[24px]">{q.displayNum}.</span>
                  <div className="w-full">
                    <p className="mb-3 font-medium leading-relaxed text-lg">{q.questionText}</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 ml-2 w-full">
                      {q.options.map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-baseline">
                          <span className="font-semibold">({opt.label})</span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="print-break"></div>

        {/* SECTION B */}
        <div>
          <div className="bg-gray-100 text-center py-2 font-bold border-y-2 border-black mb-6 print:bg-gray-100 uppercase tracking-wider">
            Section - B (Subjective) - 50 Marks
          </div>

          {/* Physical Science Questions mapped to 1, 2, 3 */}
          <div className="mb-8">
             {renderSubjectiveGroup(phy2Marks, 1)}
             {renderSubjectiveGroup(phy3Marks, 2)}
             {renderSubjectiveGroup(phy4Marks, 3)}
          </div>

          {/* Life Science Questions mapped to 4, 5, 6 */}
          <div className="mb-8">
             {renderSubjectiveGroup(life2Marks, 4)}
             {renderSubjectiveGroup(life3Marks, 5)}
             {renderSubjectiveGroup(life4Marks, 6)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperDisplay;