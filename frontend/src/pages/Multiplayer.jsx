import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import io from 'socket.io-client';
import { getApiUrl, getServerUrl } from '../config/api';

function Multiplayer() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [createdRoomCode, setCreatedRoomCode] = useState("");
  const [showRoomCode, setShowRoomCode] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const testMultiplayerRoute = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/multiplayer/test`, {
        credentials: "include",
      });
      const data = await response.json();
      console.log("Test route response:", data);
      alert(`Test route: ${data.message}`);
    } catch (error) {
      console.error("Test route error:", error);
      alert("                   failed");
    }
  };

  const handleFindOpponent = () => {
    if (!user) {
      console.error("User not found, cannot start multiplayer");
      alert("Please log in to start a multiplayer challenge");
      return;
    }
    setShowTimeSelection(true);
  };

  const handleTimeSelect = (timeLimit) => {
    setSelectedTimeLimit(timeLimit);
    setShowTimeSelection(false);

    const userId = user._id;
    const firstName = user.firstName || "Unknown";
    const lastName = user.lastName || "";
    const username = lastName ? `${firstName} ${lastName}` : firstName;

    console.log("User object:", user);
    console.log("Navigating to random challenge with:", {
      timeLimit,
      userId,
      username,
    });

    if (!userId) {
      console.error("User ID not found in user object:", user);
      alert("User ID not found. Please try logging in again.");
      return;
    }

    if (!username || username === "Unknown") {
      console.error("Username not found in user object:", user);
      alert("Username not found. Please try logging in again.");
      return;
    }

    navigate("/multiplayer/random-challenge", {
      state: { timeLimit, userId, username },
    });
  };

  const handleCreateRoom = async (timeLimit) => {
    setSelectedTimeLimit(timeLimit);
    setShowTimeSelection(false);
    setIsCreatingRoom(true);

    const userId = user._id;
    const firstName = user.firstName || "Unknown";
    const lastName = user.lastName || "";
    const username = lastName ? `${firstName} ${lastName}` : firstName;

    if (!userId || !username || username === "Unknown") {
      alert("Please log in to create a room.");
      setIsCreatingRoom(false);
      return;
    }

    try {
      const response = await fetch(
        `${getApiUrl()}/multiplayer/create-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            timeLimit,
            creatorId: userId,
            creatorUsername: username,
          }),
        }
      );

      const data = await response.json();
      console.log("Create room response:", { status: response.status, data });

      if (response.ok) {
        setCreatedRoomCode(data.roomCode);
        setShowRoomCode(true);
        setIsWaitingForOpponent(true);
        
        // Auto-start waiting for opponent
        const socket = io(getServerUrl(), {
          withCredentials: true
        });
        
        socket.on('connect', () => {
          console.log('Connected to server, waiting for opponent to join room:', data.roomCode);
          socket.emit('authenticate', { id: userId, username });
          socket.emit('wait-in-private-room', { roomCode: data.roomCode, userId, username });
        });

        // Listen for when someone joins the room and match is created
        socket.on('private-match-found', (data) => {
          console.log('Someone joined the room! Starting match:', data.match);
          socket.disconnect();
          setIsWaitingForOpponent(false);
          setShowRoomCode(false);
          
          // Navigate directly to the problem-solving page
          navigate('/multiplayer/random-challenge', { 
            state: { 
              timeLimit: timeLimit,
              userId,
              username,
              isPrivateMatch: true,
              match: data.match
            }
          });
        });

        // Listen for broadcast events as fallback
        socket.on('private-match-created', (matchData) => {
          if (matchData.roomCode === data.roomCode) {
            console.log('Match created for our room! Starting match:', matchData.match);
            socket.disconnect();
            setIsWaitingForOpponent(false);
            setShowRoomCode(false);
            
            // Navigate directly to the problem-solving page
            navigate('/multiplayer/random-challenge', { 
              state: { 
                timeLimit: timeLimit,
                userId,
                username,
                isPrivateMatch: true,
                match: matchData.match
              }
            });
          }
        });
      } else {
        console.error("Create room failed:", data);
        alert(data.message || "Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Please try again.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      alert("Please enter a room code");
      return;
    }

    const userId = user._id;
    const firstName = user.firstName || "Unknown";
    const lastName = user.lastName || "";
    const username = lastName ? `${firstName} ${lastName}` : firstName;

    if (!userId || !username || username === "Unknown") {
      alert("Please log in to join a room.");
      return;
    }

    try {
      const response = await fetch(
        `${getApiUrl()}/multiplayer/join-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            roomCode: roomCode.trim(),
            playerId: userId,
            playerUsername: username,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowJoinRoom(false);
        setRoomCode("");

        // Navigate to the multiplayer challenge with private match data
        navigate("/multiplayer/random-challenge", {
          state: {
            timeLimit: data.match.timeLimit,
            userId,
            username,
            isPrivateMatch: true,
            match: data.match,
          },
        });
      } else {
        alert(data.message || "Failed to join room");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join room. Please try again.");
    }
  };



  const handleBack = () => {
    navigate("/home");
  };

  return (
    <div
      className="min-h-screen font-sans text-gray-200"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
            rgba(139, 92, 246, 0.15) 0%,
            rgba(59, 130, 246, 0.1) 25%,
            transparent 70%
          ),
          radial-gradient(circle at top left, #0a0a0a, #1a1a1a),
          linear-gradient(135deg, #111111 0%, #0a0a0a 50%, #1a1a1a 100%)
        `,
      }}
    >
      {/* Header with back button */}
      <div className="p-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-200 mb-8 group"
        >
          <svg
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </button>

        

        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Multiplayer Arena
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
            Challenge developers worldwide in real-time coding battles. Test
            your skills, climb the ranks, and prove your coding prowess.
          </p>
        </div>

        {/* Multiplayer Options Cards */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Random Challenge Card */}
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-300 transition-colors">
                  Random Challenge
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Get matched with another developer for a real-time coding
                  challenge
                </p>

                <button
                  onClick={handleFindOpponent}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-white"
                >
                  Find Random Opponent
                </button>
              </div>
            </div>

            {/* Create Private Room Card */}
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-green-300 transition-colors">
                  Create Private Room
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Create a private room and invite friends for a custom coding
                  battle
                </p>

                <button
                  onClick={() => {
                    setIsCreatingRoom(true);
                    setShowTimeSelection(true);
                  }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-white"
                >
                  Create Room
                </button>
              </div>
            </div>

            {/* Join Room Card */}
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-orange-300 transition-colors">
                  Join Room
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Enter a room code to join a private coding battle with friends
                </p>

                <button
                  onClick={() => setShowJoinRoom(true)}
                  className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-white"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Battle Features
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need for epic coding duels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-800 text-center group hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">
                Real-time Battles
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Live coding challenges with instant feedback and real-time
                opponent tracking
              </p>
            </div>

            <div className="bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-800 text-center group hover:border-green-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">
                Smart Matching
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Advanced algorithm pairs you with opponents of similar skill
                level
              </p>
            </div>

            <div className="bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-800 text-center group hover:border-purple-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">
                Multiple Attempts
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Keep refining your solution until you achieve victory
              </p>
            </div>

            <div className="bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-800 text-center group hover:border-orange-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">
                Fair Competition
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Identical problems ensure pure skill-based competition
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Selection Modal */}
      {showTimeSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Select Time Limit
              </h3>
              <p className="text-gray-400 mb-8">
                Choose your challenge duration
              </p>

              <div className="space-y-4">
                <button
                  onClick={() =>
                    isCreatingRoom ? handleCreateRoom(5) : handleTimeSelect(5)
                  }
                  className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-white"
                >
                  5 Minutes
                </button>

                <button
                  onClick={() =>
                    isCreatingRoom ? handleCreateRoom(10) : handleTimeSelect(10)
                  }
                  className="w-full py-3 px-6 bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-yellow-500 hover:to-orange-400 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-white"
                >
                  10 Minutes
                </button>

                <button
                  onClick={() =>
                    isCreatingRoom ? handleCreateRoom(15) : handleTimeSelect(15)
                  }
                  className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-500 hover:to-pink-400 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-white"
                >
                  15 Minutes
                </button>
              </div>

              <button
                onClick={() => {
                  setShowTimeSelection(false);
                  setIsCreatingRoom(false);
                }}
                className="mt-6 px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Code Display Modal */}
      {showRoomCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className={`w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 ${isWaitingForOpponent ? 'animate-pulse' : ''}`}>
                {isWaitingForOpponent ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                {isWaitingForOpponent ? 'Waiting for Opponent...' : 'Room Created!'}
              </h3>
              <p className="text-gray-400 mb-6">
                {isWaitingForOpponent 
                  ? 'Waiting for someone to join using this code'
                  : 'Share this code with your friend'
                }
              </p>

              <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-600">
                <div className="text-3xl font-bold text-green-400 mb-2 tracking-wider">
                  {createdRoomCode}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(createdRoomCode)}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Click to copy
                </button>
              </div>

              <div className="space-y-4">
                {isWaitingForOpponent && (
                  <div className="text-center py-4">
                    <div className="text-green-400 font-semibold mb-2">🔄 Waiting for opponent...</div>
                    <div className="text-sm text-gray-400">Share the code above with your friend</div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowRoomCode(false);
                    setCreatedRoomCode("");
                    setIsWaitingForOpponent(false);
                  }}
                  className="w-full py-3 px-6 text-gray-400 hover:text-white transition-colors border border-gray-600 rounded-xl hover:border-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Join Room</h3>
              <p className="text-gray-400 mb-6">
                Enter the room code to join the battle
              </p>

              <div className="mb-6">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="w-full py-3 px-4 bg-gray-800 border border-gray-600 rounded-xl text-white text-center text-lg font-semibold tracking-wider focus:outline-none focus:border-orange-500 transition-colors"
                  maxLength={6}
                />
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleJoinRoom}
                  disabled={!roomCode.trim()}
                  className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Join Battle
                </button>

                <button
                  onClick={() => {
                    setShowJoinRoom(false);
                    setRoomCode("");
                  }}
                  className="w-full py-3 px-6 text-gray-400 hover:text-white transition-colors border border-gray-600 rounded-xl hover:border-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float-gentle {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          33% {
            transform: translateY(-8px) scale(1.05);
          }
          66% {
            transform: translateY(-4px) scale(0.95);
          }
        }

        .animate-float-gentle {
          animation: float-gentle linear infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

export default Multiplayer;
