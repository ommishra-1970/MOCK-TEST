import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QuestionPaperDisplay from './components/QuestionPaperDisplay';
import { generateMockTest } from './services/geminiService';
import { QuestionPaper } from './types';
import { Loader2, AlertCircle, Key } from 'lucide-react';

function App() {
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedSet, setSelectedSet] = useState<string>("A");
  
  const [isKeySet, setIsKeySet] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);

  useEffect(() => {
    async function checkKey() {
      const win = window as any;
      if (win.aistudio) {
        try {
          const hasKey = await win.aistudio.hasSelectedApiKey();
          setIsKeySet(hasKey);
        } catch (e) {
          console.error("Error checking API key status:", e);
          setIsKeySet(false);
        }
      } else {
        // Fallback: Check if env var is set (e.g. local .env or CI/CD secret)
        // In most build tools, process.env.API_KEY is replaced by a string.
        // We check if it exists and is not an empty string.
        const envKey = process.env.API_KEY;
        setIsKeySet(!!envKey && envKey.length > 0);
      }
      setCheckingKey(false);
    }
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const win = window as any;
    if (win.aistudio) {
      try {
        await win.aistudio.openSelectKey();
        setIsKeySet(true);
      } catch (e) {
        console.error("Error selecting API key:", e);
      }
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedPaper = await generateMockTest(selectedYear, selectedSet);
      setPaper(generatedPaper);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || String(err);
      
      // Handle missing key error from AI Studio flow
      const win = window as any;
      if (errorMessage.includes("Requested entity was not found") && win.aistudio) {
         setError("Session expired or invalid key. Please select your API key again.");
         setIsKeySet(false);
      } else {
         setError("Failed to generate the question paper. Please check your API key and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPaper(null);
    setError(null);
  };

  const years = ["2026", "2027", "2028", "2029", "2030"];
  const sets = ["A", "B", "C", "D"];

  if (checkingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!isKeySet ? (
           <div className="max-w-md mx-auto mt-20 text-center bg-white p-8 rounded-lg shadow-md border border-gray-200">
             <Key className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-gray-900 mb-2">API Key Required</h2>
             <p className="text-gray-600 mb-6">
               To generate mock tests, this application requires a Google Gemini API key. 
             </p>
             
             {(window as any).aistudio ? (
               <button
                 onClick={handleSelectKey}
                 className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
               >
                 Select API Key
               </button>
             ) : (
                <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200 text-left">
                  <p className="font-bold mb-1">Configuration Required:</p>
                  <p>Running in standalone mode. Please configure the <code>API_KEY</code> environment variable in your deployment settings or local environment file.</p>
                </div>
             )}
             
             <p className="mt-4 text-xs text-gray-400">
               <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-500">
                 Billing Information
               </a>
             </p>
           </div>
        ) : !paper ? (
          <div className="max-w-3xl mx-auto text-center mb-12 no-print">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              Create Competency-Based Mock Tests
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Generate a complete 100-mark Pre-Board question paper for Class X General Science following the strict BSE Odisha pattern. 
            </p>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-8 max-w-xl mx-auto border border-gray-200">
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-left">
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
                        <select 
                            id="year"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="text-left">
                        <label htmlFor="set" className="block text-sm font-medium text-gray-700 mb-1">Select Set</label>
                        <select 
                            id="set"
                            value={selectedSet}
                            onChange={(e) => setSelectedSet(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                        >
                            {sets.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                
                <button
                onClick={handleGenerate}
                disabled={loading}
                className={`
                    w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white 
                    ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'}
                `}
                >
                {loading ? (
                    <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6" />
                    Generating Paper...
                    </>
                ) : (
                    'Generate Question Paper'
                )}
                </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 rounded-md flex flex-col items-center justify-center text-red-700 text-center">
                <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="font-bold">Error</span>
                </div>
                {error}
                {error.includes("expired") && (
                    <button onClick={handleSelectKey} className="mt-2 text-sm underline text-indigo-600 hover:text-indigo-800">
                        Reselect API Key
                    </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <QuestionPaperDisplay paper={paper} onClear={handleClear} />
          </div>
        )}
        
        {!paper && !loading && isKeySet && (
           <div className="max-w-4xl mx-auto mt-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200 no-print">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Pre-Board Pattern Breakdown</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-bold text-blue-800 mb-2">Section A: Objective (50 Marks)</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>50 Multiple Choice Questions</li>
                    <li>1 Mark each</li>
                    <li>Q1-Q25: Physical Science</li>
                    <li>Q26-Q50: Life Science</li>
                    <li><strong>50% Competency Based Questions</strong></li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <h4 className="font-bold text-green-800 mb-2">Section B: Subjective (50 Marks)</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li><strong>Physical Science (25 Marks):</strong> Q1 (2m x 4), Q2 (3m x 3), Q3 (4m x 2)</li>
                    <li><strong>Life Science (25 Marks):</strong> Q4 (2m x 4), Q5 (3m x 3), Q6 (4m x 2)</li>
                    <li>All subjective questions have internal OR options from <strong>different chapters</strong>.</li>
                  </ul>
                </div>
              </div>
           </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 no-print mt-auto">
        <div className="text-center">
          <p>&copy; {new Date().getFullYear()} Odia Science Mock Test Generator. Powered by Gemini 2.5 Flash.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;