import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
  python: 'Python',
};

function ProblemSolver({
  problem,
  initialCode = '',
  initialLanguage = 'javascript',
  onRun,
  onSubmit,
  runResult,
  submitResult,
  loading,
  onLanguageChange: onLangChangeProp,
  onCodeChange: onCodeChangeProp,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(initialCode);
  const editorRef = useRef(null);

  const handleEditorChange = (value) => {
    setCode(value || '');
    if (onCodeChangeProp) onCodeChangeProp(value || '');
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (onLangChangeProp) onLangChangeProp(lang);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Problem Description */}
      <div className="bg-base-100 border border-base-300 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-base-content">{problem?.title}</h1>
        <div className="text-base text-base-content/80 whitespace-pre-wrap mb-4">{problem?.description}</div>
        {/* Examples */}
        {problem?.visibleTestCases && problem.visibleTestCases.length > 0 && (
          <div className="mb-4">
            <h2 className="font-semibold mb-2 text-base-content">Examples:</h2>
            {problem.visibleTestCases.map((ex, i) => (
              <div key={i} className="mb-2 p-3 bg-base-200 border border-base-300 rounded-lg">
                <div><span className="font-semibold text-base-content">Input:</span> <span className="font-mono text-base-content/80">{ex.input}</span></div>
                <div><span className="font-semibold text-base-content">Output:</span> <span className="font-mono text-base-content/80">{ex.output}</span></div>
                {ex.explanation && <div className="text-sm text-base-content/60 mt-1">{ex.explanation}</div>}
              </div>
            ))}
          </div>
        )}
        {/* Constraints */}
        {problem?.constraints && (
          <div className="mt-2 text-sm text-base-content/60">
            <span className="font-semibold">Constraints:</span> {problem.constraints}
          </div>
        )}
      </div>
      {/* Language Selector */}
      <div className="flex items-center gap-4">
        <span className="font-medium text-base-content">Language:</span>
        <select
          className="select select-bordered select-sm bg-base-100 text-base-content border-base-300 focus:border-primary"
          value={selectedLanguage}
          onChange={e => handleLanguageChange(e.target.value)}
        >
          {Object.keys(langMap).map(lang => (
            <option key={lang} value={lang}>{langMap[lang]}</option>
          ))}
        </select>
      </div>
      {/* Monaco Editor */}
      <div className="h-64 border border-base-300 rounded-lg overflow-hidden shadow-sm">
        <Editor
          height="100%"
          language={selectedLanguage}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'line',
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            mouseWheelZoom: true,
          }}
        />
      </div>
      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          className="btn btn-info btn-md px-8 font-medium transition-all duration-200 disabled:opacity-60"
          onClick={() => onRun && onRun(code, selectedLanguage)}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Running...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 6h1m4 0h1M9 2h1m4 0h1" />
              </svg>
              Run
            </>
          )}
        </button>
        <button
          className="btn btn-success btn-md px-8 font-medium transition-all duration-200 disabled:opacity-60"
          onClick={() => onSubmit && onSubmit(code, selectedLanguage)}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Submitting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Submit
            </>
          )}
        </button>
      </div>
      {/* Run/Submit Results */}
      {runResult && (
        <div className="bg-base-200 border border-base-300 rounded-xl p-6 mt-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base-content mb-2 flex items-center gap-2">
                <span>Run Result</span>
                <div className="badge badge-info badge-sm">Test</div>
              </h3>
              <div className="bg-base-100 border border-base-300 rounded-lg p-4 font-mono text-sm text-base-content/80 whitespace-pre-wrap">
                {typeof runResult === 'string' ? runResult : JSON.stringify(runResult, null, 2)}
              </div>
            </div>
          </div>
        </div>
      )}
      {submitResult && (
        <div className="bg-base-200 border border-base-300 rounded-xl p-6 mt-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base-content mb-2 flex items-center gap-2">
                <span>Submit Result</span>
                <div className="badge badge-success badge-sm">Final</div>
              </h3>
              <div className="bg-base-100 border border-base-300 rounded-lg p-4 font-mono text-sm text-base-content/80 whitespace-pre-wrap">
                {typeof submitResult === 'string' ? submitResult : JSON.stringify(submitResult, null, 2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProblemSolver; 