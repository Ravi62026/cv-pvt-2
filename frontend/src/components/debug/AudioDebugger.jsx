import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Headphones,
  Speaker,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';

const AudioDebugger = ({ 
  localStream, 
  remoteStream, 
  isConnected,
  callStatus,
  remoteAudioRef 
}) => {
  const [localAudioInfo, setLocalAudioInfo] = useState(null);
  const [remoteAudioInfo, setRemoteAudioInfo] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [localAnalyser, setLocalAnalyser] = useState(null);
  const [remoteAnalyser, setRemoteAnalyser] = useState(null);
  const [localVolume, setLocalVolume] = useState(0);
  const [remoteVolume, setRemoteVolume] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [testAudioPlaying, setTestAudioPlaying] = useState(false);
  const testAudioRef = useRef(null);

  // Monitor local audio stream
  useEffect(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      setLocalAudioInfo({
        streamId: localStream.id,
        active: localStream.active,
        audioTracks: audioTracks.map(track => ({
          id: track.id,
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          settings: track.getSettings(),
          constraints: track.getConstraints()
        }))
      });

      // Set up audio analysis
      if (audioTracks.length > 0 && !audioContext) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const source = ctx.createMediaStreamSource(localStream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          
          setAudioContext(ctx);
          setLocalAnalyser(analyser);
        } catch (error) {
          console.error('Failed to create audio context for local stream:', error);
        }
      }
    } else {
      setLocalAudioInfo(null);
    }
  }, [localStream, audioContext]);

  // Monitor remote audio stream
  useEffect(() => {
    if (remoteStream) {
      const audioTracks = remoteStream.getAudioTracks();
      setRemoteAudioInfo({
        streamId: remoteStream.id,
        active: remoteStream.active,
        audioTracks: audioTracks.map(track => ({
          id: track.id,
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          settings: track.getSettings()
        }))
      });

      // Set up remote audio analysis
      if (audioTracks.length > 0 && audioContext) {
        try {
          const source = audioContext.createMediaStreamSource(remoteStream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          
          setRemoteAnalyser(analyser);
        } catch (error) {
          console.error('Failed to create audio analyser for remote stream:', error);
        }
      }
    } else {
      setRemoteAudioInfo(null);
    }
  }, [remoteStream, audioContext]);

  // Monitor audio levels
  useEffect(() => {
    if (!localAnalyser && !remoteAnalyser) return;

    const updateAudioLevels = () => {
      if (localAnalyser) {
        const dataArray = new Uint8Array(localAnalyser.frequencyBinCount);
        localAnalyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setLocalVolume(Math.round(average));
      }

      if (remoteAnalyser) {
        const dataArray = new Uint8Array(remoteAnalyser.frequencyBinCount);
        remoteAnalyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setRemoteVolume(Math.round(average));
      }
    };

    const interval = setInterval(updateAudioLevels, 100);
    return () => clearInterval(interval);
  }, [localAnalyser, remoteAnalyser]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'live':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'failed':
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const testRemoteAudio = () => {
    if (remoteAudioRef?.current) {
      if (testAudioPlaying) {
        remoteAudioRef.current.pause();
        setTestAudioPlaying(false);
      } else {
        remoteAudioRef.current.play().then(() => {
          setTestAudioPlaying(true);
        }).catch(error => {
          console.error('Failed to play remote audio:', error);
        });
      }
    }
  };

  const testSystemAudio = () => {
    // Create a test tone
    if (audioContext) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 right-4 bg-black/90 backdrop-blur-sm text-white rounded-lg shadow-xl border border-gray-700 z-50 max-w-sm"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Headphones className="h-4 w-4" />
          <span className="text-sm font-medium">Audio Debug</span>
          {isConnected ? (
            <Volume2 className="h-4 w-4 text-green-500" />
          ) : (
            <VolumeX className="h-4 w-4 text-red-500" />
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-gray-400"
        >
          ▼
        </motion.div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-700 p-3 space-y-3 max-h-96 overflow-y-auto"
        >
          {/* Call Status */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-300">Call Status</h4>
            <div className="flex items-center space-x-2 text-xs">
              {getStatusIcon(callStatus)}
              <span>{callStatus || 'Unknown'}</span>
            </div>
          </div>

          {/* Local Audio */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-300">Local Audio</h4>
            {localAudioInfo ? (
              <div className="space-y-1 text-xs">
                <div>Stream Active: {localAudioInfo.active ? '✅' : '❌'}</div>
                <div>Audio Tracks: {localAudioInfo.audioTracks.length}</div>
                <div className="flex items-center space-x-2">
                  <span>Level:</span>
                  <div className="flex-1 bg-gray-700 rounded h-2">
                    <div 
                      className="bg-green-500 h-2 rounded transition-all"
                      style={{ width: `${Math.min(localVolume * 2, 100)}%` }}
                    />
                  </div>
                  <span>{localVolume}</span>
                </div>
                {localAudioInfo.audioTracks.map((track, index) => (
                  <div key={index} className="ml-2 text-gray-400">
                    Track {index}: {track.enabled ? '✅' : '❌'} ({track.readyState})
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400">No local audio</div>
            )}
          </div>

          {/* Remote Audio */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-300">Remote Audio</h4>
            {remoteAudioInfo ? (
              <div className="space-y-1 text-xs">
                <div>Stream Active: {remoteAudioInfo.active ? '✅' : '❌'}</div>
                <div>Audio Tracks: {remoteAudioInfo.audioTracks.length}</div>
                <div className="flex items-center space-x-2">
                  <span>Level:</span>
                  <div className="flex-1 bg-gray-700 rounded h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded transition-all"
                      style={{ width: `${Math.min(remoteVolume * 2, 100)}%` }}
                    />
                  </div>
                  <span>{remoteVolume}</span>
                </div>
                {remoteAudioInfo.audioTracks.map((track, index) => (
                  <div key={index} className="ml-2 text-gray-400">
                    Track {index}: {track.enabled ? '✅' : '❌'} ({track.readyState})
                  </div>
                ))}
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={testRemoteAudio}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                  >
                    {testAudioPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={testSystemAudio}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                  >
                    <Speaker className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400">No remote audio</div>
            )}
          </div>

          {/* Audio Element Status */}
          {remoteAudioRef?.current && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-300">Audio Element</h4>
              <div className="space-y-1 text-xs">
                <div>Paused: {remoteAudioRef.current.paused ? '❌' : '✅'}</div>
                <div>Muted: {remoteAudioRef.current.muted ? '❌' : '✅'}</div>
                <div>Volume: {Math.round(remoteAudioRef.current.volume * 100)}%</div>
                <div>Ready State: {remoteAudioRef.current.readyState}</div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AudioDebugger;
