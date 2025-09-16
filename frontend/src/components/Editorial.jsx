import { useState, useRef, useEffect } from 'react';
import { 
  Pause, 
  Play, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  SkipBack,
  SkipForward,
  Minimize
} from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration || 0);
  const [isHovering, setIsHovering] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [buffered, setBuffered] = useState(0);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoDuration, videoRef.current.currentTime + 10);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        setBuffered((bufferedEnd / duration) * 100);
      }
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <>
      <style>{`
        .video-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        .video-slider::-webkit-slider-track {
          background: transparent;
          height: 4px;
          border-radius: 2px;
        }
        
        .video-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: #3b82f6;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .video-slider::-webkit-slider-thumb:hover {
          background: #2563eb;
          transform: scale(1.2);
        }
        
        .video-slider::-moz-range-track {
          background: transparent;
          height: 4px;
          border-radius: 2px;
          border: none;
        }
        
        .video-slider::-moz-range-thumb {
          background: #3b82f6;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        
        .video-slider::-moz-range-thumb:hover {
          background: #2563eb;
          transform: scale(1.2);
        }
      `}</style>
      <div 
      ref={containerRef}
      className={`relative w-full mx-auto rounded-xl overflow-hidden shadow-lg bg-black ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'max-w-4xl'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      tabIndex={0}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="loading loading-spinner loading-lg text-white"></div>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        className="w-full aspect-video bg-black cursor-pointer"
        preload="metadata"
      />
      
      {/* Video Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          isHovering || !isPlaying || showSettings ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="relative h-1 bg-gray-700 rounded-full">
            {/* Buffer Bar */}
            <div 
              className="absolute top-0 left-0 h-full bg-gray-600 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* Progress Bar */}
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
              style={{ width: `${(currentTime / videoDuration) * 100}%` }}
            />
            {/* Progress Input */}
            <input
              type="range"
              min="0"
              max={videoDuration}
              value={currentTime}
              onChange={handleProgressChange}
              className="absolute inset-0 w-full h-full appearance-none cursor-pointer video-slider bg-transparent"
            />
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-blue-400 transition-colors p-1"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            {/* Skip Backward */}
            <button
              onClick={skipBackward}
              className="text-white hover:text-blue-400 transition-colors p-1"
              aria-label="Skip backward 10 seconds"
            >
              <SkipBack size={20} />
            </button>

            {/* Skip Forward */}
            <button
              onClick={skipForward}
              className="text-white hover:text-blue-400 transition-colors p-1"
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward size={20} />
            </button>

            {/* Volume Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors p-1"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer video-slider"
              />
            </div>

            {/* Time Display */}
            <div className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-blue-400 transition-colors p-1"
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>
              
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-lg p-3 min-w-[150px]">
                  <div className="text-white text-sm font-semibold mb-2">Playback Speed</div>
                  <div className="space-y-1">
                    {playbackRates.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                        className={`block w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                          playbackRate === rate 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {rate}x {rate === 1 ? '(Normal)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors p-1"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute top-4 right-4">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-xs btn-circle btn-ghost text-white opacity-50 hover:opacity-100">
            ?
          </label>
          <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-gray-900 text-white">
            <div className="card-body">
              <h3 className="font-bold text-sm">Keyboard Shortcuts</h3>
              <div className="text-xs space-y-1">
                <div><kbd className="kbd kbd-xs">Space</kbd> Play/Pause</div>
                <div><kbd className="kbd kbd-xs">←</kbd> Skip back 10s</div>
                <div><kbd className="kbd kbd-xs">→</kbd> Skip forward 10s</div>
                <div><kbd className="kbd kbd-xs">↑</kbd> Volume up</div>
                <div><kbd className="kbd kbd-xs">↓</kbd> Volume down</div>
                <div><kbd className="kbd kbd-xs">M</kbd> Mute/Unmute</div>
                <div><kbd className="kbd kbd-xs">F</kbd> Fullscreen</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close settings */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
    </>
  );
};


export default Editorial;