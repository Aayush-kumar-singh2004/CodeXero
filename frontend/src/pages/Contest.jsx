import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import ContestSolve from '../components/ContestSolve';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
  python: 'Python'
};

const DEFAULT_LANGUAGE = 'javascript';

function Contest() {
  const [problemIds, setProblemIds] = useState([]);
  const [problems, setProblems] = useState([]); // full problem objects
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [points, setPoints] = useState(0);
  const [timer, setTimer] = useState(300); // 5 min default
  const [timeUp, setTimeUp] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANGUAGE);
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  
  // Get user from Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Check authentication and fetch problems
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        // Pick 5 random unique problems
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 5);
        setProblemIds(selected.map(p => p._id));
      } catch (err) {
        setProblemIds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [isAuthenticated, navigate]);

  // Fetch full problem details for current question
  useEffect(() => {
    const fetchProblemDetails = async () => {
      if (!problemIds.length) return;
      setLoading(true);
      try {
        const promises = problemIds.map(id => axiosClient.get(`/problem/problemById/${id}`));
        const results = await Promise.all(promises);
        setProblems(results.map(r => r.data));
      } catch (err) {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    if (problemIds.length) fetchProblemDetails();
  }, [problemIds]);

  // Timer logic (mock for now)
  useEffect(() => {
    if (loading || !problems.length) return;
    setTimeUp(false);
    setTimer(300); // 5 min for all for now
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          setTimeUp(true);
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIdx, loading, problems.length]);

  // Update starter code when problem or language changes
  useEffect(() => {
    if (!problems.length) return;
    const currentProblem = problems[currentIdx];
    const startCodeObj = currentProblem.startCode?.find(
      sc => sc.language === (selectedLanguage === 'cpp' ? 'C++' : langMap[selectedLanguage])
    );
    setCode(startCodeObj ? startCodeObj.initialCode : '');
  }, [problems, currentIdx, selectedLanguage]);

  // Helper to finish contest: save score and navigate
  const finishContest = async () => {
    try {
      // Get userId from Redux state
      const userId = user?._id;
      if (userId && isAuthenticated) {
        console.log('Saving contest score:', { userId, score: points }); // Debug log
        await axiosClient.post('/contest-leaderboard', { userId, score: points });
        console.log('Contest score saved successfully'); // Debug log
      } else {
        console.log('User not authenticated or userId missing:', { userId, isAuthenticated }); // Debug log
      }
    } catch (err) {
      console.error('Error saving contest score:', err); // Debug log
    }
    navigate('/contest-summary', { state: { score: points } });
  };

  if (loading || !problems.length) {
    return (
      <div className="w-full h-screen min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const currentProblem = problems[currentIdx];
  const progress = { current: currentIdx + 1, total: problems.length };

  // Handlers
  const handleRun = async (codeToRun, language) => {
    setRunResult('Running...');
    try {
      const { data } = await axiosClient.post(`/submission/run/${currentProblem._id}`, { code: codeToRun, language });
      setRunResult(data);
    } catch (err) {
      setRunResult('Run error');
    }
  };

  const handleSubmit = async (codeToSubmit, language) => {
    setSubmitResult('Submitting...');
    try {
      const { data } = await axiosClient.post(`/submission/submit/${currentProblem._id}`, { code: codeToSubmit, language });
      setSubmitResult(data);
      if (data.accepted && !timeUp) {
        setPoints(p => p + 10); // 10 points per question for now
      }
      setTimeout(() => {
        setSubmitResult(null);
        setRunResult(null);
        if (currentIdx < problems.length - 1) {
          setCurrentIdx(idx => idx + 1);
        } else {
          finishContest();
        }
      }, 1500);
    } catch (err) {
      setSubmitResult('Submit error');
    }
  };

  const handleSkip = () => {
    setRunResult(null);
    setSubmitResult(null);
    if (currentIdx < problems.length - 1) {
      setCurrentIdx(idx => idx + 1);
    } else {
      finishContest();
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    // Update code to starter code for new language
    const startCodeObj = currentProblem.startCode?.find(
      sc => sc.language === (lang === 'cpp' ? 'C++' : langMap[lang])
    );
    setCode(startCodeObj ? startCodeObj.initialCode : '');
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  return (
    <div className="w-full h-screen min-h-screen bg-[#181a1b] text-[#f7f9fb] flex flex-col font-['Inter']">
      <ContestSolve
        problem={currentProblem}
        initialCode={code}
        initialLanguage={selectedLanguage}
        onRun={handleRun}
        onSubmit={handleSubmit}
        runResult={runResult}
        submitResult={submitResult}
        loading={loading}
        timer={timer}
        points={points}
        progress={progress}
        onSkip={handleSkip}
        timeUp={timeUp}
        onLanguageChange={handleLanguageChange}
        onCodeChange={handleCodeChange}
        darkMode={true}
      />
    </div>
  );
}

export default Contest; 