import Lenis from "@studio-freight/lenis";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router";
import { checkAuth } from "./authSlice";
import AdminDelete from "./components/AdminDelete";
import AdminPanel from "./components/AdminPanel";
import AdminUpdate from "./components/AdminUpdate";
import AdminUpload from "./components/AdminUpload";
import AdminVideo from "./components/AdminVideo";
import AINavigationAssistant from "./components/AINavigationAssistant";
import AboutUs from "./pages/AboutUs";
import Admin from "./pages/Admin";
import AlgorithmCategory from "./pages/AlgorithmCategory";
import Algorithms from "./pages/Algorithms";
import Blog from "./pages/Blog";
import ComboAptitudeReasoningPractice from "./pages/ComboAptitudeReasoningPractice";
import Community from "./pages/Community";
import Contact from "./pages/Contact";
import Contest from "./pages/Contest";
import ContestSummary from "./pages/ContestSummary";
import DataStructureCategory from "./pages/DataStructureCategory";
import DataStructures from "./pages/DataStructures";
import FAQ from "./pages/FAQ";
import GraphVisualizer from "./pages/GraphVisualizer";
import Guides from "./pages/Guides";
import BehavioralInterviewGuide from "./pages/guides/BehavioralInterviewGuide";
import BigTechInterviewGuide from "./pages/guides/BigTechInterviewGuide";
import CodingContestStrategy from "./pages/guides/CodingContestStrategy";
import DSAInterviewRoadmap from "./pages/guides/DSAInterviewRoadmap";
import JuniorDeveloperCareer from "./pages/guides/JuniorDeveloperCareer";
import SystemDesignMastery from "./pages/guides/SystemDesignMastery";
import Homepage from "./pages/Homepage";
import LeaderboardPage from "./pages/LeaderboardPage";
import Login from "./pages/Login";
import MockHRWithAI from "./pages/MockHRWithAI";
import Multiplayer from "./pages/Multiplayer";
import MultiplayerRandomChallenge from "./pages/MultiplayerRandomChallenge";
import NQueensVisualizer from "./pages/NQueensVisualizer";
import Practice from "./pages/Practice";
import PracticeBehavioralWithAI from "./pages/PracticeBehavioralWithAI";
import PracticeDSAWithAI from "./pages/PracticeDSAWithAI";
import PracticeSystemDesignWithAI from "./pages/PracticeSystemDesignWithAI";
import Pricing from "./pages/Pricing";
import ProblemPage from "./pages/ProblemPage";
import Problems from "./pages/Problems";
import Profile from "./pages/Profile";
import QueueVisualizer from "./pages/QueueVisualizer";
import SearchingVisualizer from "./pages/SearchingVisualizer";
import Signup from "./pages/Signup";
import SortingVisualizer from "./pages/SortingVisualizer";
import StackVisualizer from "./pages/StackVisualizer";
import SudokuVisualizer from "./pages/SudokuVisualizer";
import TreeVisualizer from "./pages/TreeVisualizer";
import UnderstandProblem from "./pages/UnderstandProblem";
import UserProfile from "./pages/UserProfile";
import Visualize from "./pages/Visualize";
import Welcome from "./pages/Welcome";
 
function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smooth: true,
      direction: "vertical",
      gestureDirection: "vertical",
      smoothTouch: false,
      touchMultiplier: 1.5,
      infinite: false,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      {/* AI Navigation Assistant - appears on all pages */}
      <AINavigationAssistant />

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/home"
          element={isAuthenticated ? <Homepage /> : <Navigate to="/signup" />}
        />
        <Route
          path="/problems"
          element={isAuthenticated ? <Problems /> : <Navigate to="/signup" />}
        />
        <Route
          path="/data-structures"
          element={
            isAuthenticated ? <DataStructures /> : <Navigate to="/signup" />
          }
        />
        <Route
          path="/data-structures/:categoryId"
          element={
            isAuthenticated ? (
              <DataStructureCategory />
            ) : (
              <Navigate to="/signup" />
            )
          }
        />
        <Route
          path="/algorithms"
          element={isAuthenticated ? <Algorithms /> : <Navigate to="/signup" />}
        />
        <Route
          path="/algorithms/:categoryId"
          element={
            isAuthenticated ? <AlgorithmCategory /> : <Navigate to="/signup" />
          }
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
        />
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <Admin />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/create"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/update"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminUpdate />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/delete"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminDelete />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/video"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminVideo />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/upload/:problemId"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminUpload />
            ) : (
              <Navigate to="/signup" />
            )
          }
        />
        <Route path="/problem/:problemId" element={<ProblemPage />}></Route>
        <Route
          path="/community"
          element={isAuthenticated ? <Community /> : <Navigate to="/signup" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/signup" />}
        />
        <Route
          path="/practice"
          element={isAuthenticated ? <Practice /> : <Navigate to="/signup" />}
        />
        <Route
          path="/practice/dsa-with-ai"
          element={
            isAuthenticated ? <PracticeDSAWithAI /> : <Navigate to="/signup" />
          }
        />
        <Route
          path="/practice/behavioral-with-ai"
          element={
            isAuthenticated ? (
              <PracticeBehavioralWithAI />
            ) : (
              <Navigate to="/signup" />
            )
          }
        />
        <Route
          path="/practice/system-design-with-ai"
          element={
            isAuthenticated ? (
              <PracticeSystemDesignWithAI />
            ) : (
              <Navigate to="/signup" />
            )
          }
        />

        <Route
          path="/practice/mock-hr-technical"
          element={
            isAuthenticated ? <MockHRWithAI /> : <Navigate to="/signup" />
          }
        />
        <Route
          path="/practice/combo-aptitude-reasoning"
          element={
            isAuthenticated ? (
              <ComboAptitudeReasoningPractice />
            ) : (
              <Navigate to="/signup" />
            )
          }
        />
        <Route
          path="/leaderboard"
          element={
            isAuthenticated ? <LeaderboardPage /> : <Navigate to="/signup" />
          }
        />
        <Route
          path="/contest"
          element={isAuthenticated ? <Contest /> : <Navigate to="/signup" />}
        />
        <Route
          path="/contest-summary"
          element={
            isAuthenticated ? <ContestSummary /> : <Navigate to="/signup" />
          }
        />
        <Route
          path="/user/:userId"
          element={
            isAuthenticated ? <UserProfile /> : <Navigate to="/signup" />
          }
        />

        {/* Public pages - accessible without authentication */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />

        {/* Individual Guide Pages */}
        <Route path="/guides/dsa-roadmap" element={<DSAInterviewRoadmap />} />
        <Route
          path="/guides/system-design-mastery"
          element={<SystemDesignMastery />}
        />
        <Route
          path="/guides/behavioral-interview"
          element={<BehavioralInterviewGuide />}
        />
        <Route
          path="/guides/coding-contest-strategy"
          element={<CodingContestStrategy />}
        />
        <Route
          path="/guides/big-tech-interview"
          element={<BigTechInterviewGuide />}
        />
        <Route
          path="/guides/junior-developer-career"
          element={<JuniorDeveloperCareer />}
        />

        {/* Visualizer Routes */}
        <Route
          path="/visualize"
          element={isAuthenticated ? <Visualize /> : <Navigate to="/signup" />}
        />
        <Route
          path="/searching-visualizer"
          element={isAuthenticated ? <SearchingVisualizer /> : <Navigate to="/signup" />}
        />
        <Route
          path="/sorting-visualizer"
          element={isAuthenticated ? <SortingVisualizer /> : <Navigate to="/signup" />}
        />
        <Route
          path="/nqueens-visualizer"
          element={isAuthenticated ? <NQueensVisualizer /> : <Navigate to="/signup" />}
        />
        <Route
          path="/sudoku-visualizer"
          element={isAuthenticated ? <SudokuVisualizer /> : <Navigate to="/signup" />}
        />
        <Route
          path="/stack-visualizer"
          element={isAuthenticated ? <StackVisualizer /> : <Navigate to="/signup" />}
        />
        <Route
          path="/queue-visualizer"
          element={isAuthenticated ? <QueueVisualizer /> : <Navigate to="/signup" />}
        />
        <Route
          path="/graph-visualizer"
          element={isAuthenticated ? <GraphVisualizer /> : <Navigate to="/signup" />}
        />
        <Route
          path="/tree-visualizer"
          element={isAuthenticated ? <TreeVisualizer /> : <Navigate to="/signup" />}
        />
        <Route
          path="/understand-problem"
          element={isAuthenticated ? <UnderstandProblem /> : <Navigate to="/signup" />}
        />
        
        {/* Multiplayer Routes */}
        <Route
          path="/multiplayer"
          element={isAuthenticated ? <Multiplayer /> : <Navigate to="/signup" />}
        />
        <Route
          path="/multiplayer/random-challenge"
          element={isAuthenticated ? <MultiplayerRandomChallenge /> : <Navigate to="/signup" />}
        />
       
      </Routes>
      
    </>
  );
}

export default App;
