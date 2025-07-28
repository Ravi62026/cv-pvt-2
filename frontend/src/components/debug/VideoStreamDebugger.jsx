import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Wifi, 
  WifiOff,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const VideoStreamDebugger = ({ 
  localStream, 
  remoteStream, 
  peerConnection,
  isConnected,
  callStatus 
}) => {
  const [localStreamInfo, setLocalStreamInfo] = useState(null);
  const [remoteStreamInfo, setRemoteStreamInfo] = useState(null);
  const [connectionStats, setConnectionStats] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const localDebugVideoRef = useRef(null);
  const remoteDebugVideoRef = useRef(null);

  // Monitor local stream
  useEffect(() => {
    if (localStream) {
      const tracks = localStream.getTracks();
      const videoTracks = localStream.getVideoTracks();
      const audioTracks = localStream.getAudioTracks();
      
      setLocalStreamInfo({
        id: localStream.id,
        active: localStream.active,
        totalTracks: tracks.length,
        videoTracks: videoTracks.map(track => ({
          id: track.id,
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          settings: track.getSettings()
        })),
        audioTracks: audioTracks.map(track => ({
          id: track.id,
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          settings: track.getSettings()
        }))
      });

      // Set debug video
      if (localDebugVideoRef.current) {
        localDebugVideoRef.current.srcObject = localStream;
      }
    } else {
      setLocalStreamInfo(null);
    }
  }, [localStream]);

  // Monitor remote stream
  useEffect(() => {
    if (remoteStream) {
      const tracks = remoteStream.getTracks();
      const videoTracks = remoteStream.getVideoTracks();
      const audioTracks = remoteStream.getAudioTracks();
      
      setRemoteStreamInfo({
        id: remoteStream.id,
        active: remoteStream.active,
        totalTracks: tracks.length,
        videoTracks: videoTracks.map(track => ({
          id: track.id,
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          settings: track.getSettings()
        })),
        audioTracks: audioTracks.map(track => ({
          id: track.id,
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          settings: track.getSettings()
        }))
      });

      // Set debug video
      if (remoteDebugVideoRef.current) {
        remoteDebugVideoRef.current.srcObject = remoteStream;
      }
    } else {
      setRemoteStreamInfo(null);
    }
  }, [remoteStream]);

  // Monitor connection stats
  useEffect(() => {
    if (peerConnection) {
      const interval = setInterval(async () => {
        try {
          const stats = await peerConnection.getStats();
          const statsArray = Array.from(stats.values());
          
          const inboundRtp = statsArray.find(stat => stat.type === 'inbound-rtp' && stat.mediaType === 'video');
          const outboundRtp = statsArray.find(stat => stat.type === 'outbound-rtp' && stat.mediaType === 'video');
          const candidatePair = statsArray.find(stat => stat.type === 'candidate-pair' && stat.state === 'succeeded');
          
          setConnectionStats({
            connectionState: peerConnection.connectionState,
            iceConnectionState: peerConnection.iceConnectionState,
            signalingState: peerConnection.signalingState,
            inboundVideo: inboundRtp ? {
              bytesReceived: inboundRtp.bytesReceived,
              packetsReceived: inboundRtp.packetsReceived,
              packetsLost: inboundRtp.packetsLost,
              framesReceived: inboundRtp.framesReceived,
              framesDropped: inboundRtp.framesDropped
            } : null,
            outboundVideo: outboundRtp ? {
              bytesSent: outboundRtp.bytesSent,
              packetsSent: outboundRtp.packetsSent,
              framesSent: outboundRtp.framesSent
            } : null,
            candidatePair: candidatePair ? {
              state: candidatePair.state,
              bytesReceived: candidatePair.bytesReceived,
              bytesSent: candidatePair.bytesSent,
              currentRoundTripTime: candidatePair.currentRoundTripTime
            } : null
          });
        } catch (error) {
          console.error('Failed to get connection stats:', error);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [peerConnection]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'live':
      case 'ended':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'failed':
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm text-white rounded-lg shadow-xl border border-gray-700 z-50"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Monitor className="h-4 w-4" />
          <span className="text-sm font-medium">Stream Debug</span>
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
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

          {/* Local Stream */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-300">Local Stream</h4>
            {localStreamInfo ? (
              <div className="space-y-1 text-xs">
                <div>Active: {localStreamInfo.active ? '✅' : '❌'}</div>
                <div>Video Tracks: {localStreamInfo.videoTracks.length}</div>
                <div>Audio Tracks: {localStreamInfo.audioTracks.length}</div>
                {localStreamInfo.videoTracks.map((track, index) => (
                  <div key={index} className="ml-2 text-gray-400">
                    Video: {track.enabled ? '✅' : '❌'} ({track.readyState})
                  </div>
                ))}
                {localStreamInfo.audioTracks.map((track, index) => (
                  <div key={index} className="ml-2 text-gray-400">
                    Audio: {track.enabled ? '✅' : '❌'} ({track.readyState})
                  </div>
                ))}
                <video
                  ref={localDebugVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-20 h-15 bg-gray-800 rounded border"
                />
              </div>
            ) : (
              <div className="text-xs text-gray-400">No local stream</div>
            )}
          </div>

          {/* Remote Stream */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-300">Remote Stream</h4>
            {remoteStreamInfo ? (
              <div className="space-y-1 text-xs">
                <div>Active: {remoteStreamInfo.active ? '✅' : '❌'}</div>
                <div>Video Tracks: {remoteStreamInfo.videoTracks.length}</div>
                <div>Audio Tracks: {remoteStreamInfo.audioTracks.length}</div>
                {remoteStreamInfo.videoTracks.map((track, index) => (
                  <div key={index} className="ml-2 text-gray-400">
                    Video: {track.enabled ? '✅' : '❌'} ({track.readyState})
                  </div>
                ))}
                {remoteStreamInfo.audioTracks.map((track, index) => (
                  <div key={index} className="ml-2 text-gray-400">
                    Audio: {track.enabled ? '✅' : '❌'} ({track.readyState})
                  </div>
                ))}
                <video
                  ref={remoteDebugVideoRef}
                  autoPlay
                  playsInline
                  className="w-20 h-15 bg-gray-800 rounded border"
                />
              </div>
            ) : (
              <div className="text-xs text-gray-400">No remote stream</div>
            )}
          </div>

          {/* Connection Stats */}
          {connectionStats && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-300">Connection</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(connectionStats.connectionState)}
                  <span>Connection: {connectionStats.connectionState}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(connectionStats.iceConnectionState)}
                  <span>ICE: {connectionStats.iceConnectionState}</span>
                </div>
                <div>Signaling: {connectionStats.signalingState}</div>
                {connectionStats.candidatePair && (
                  <div className="text-gray-400">
                    RTT: {Math.round(connectionStats.candidatePair.currentRoundTripTime * 1000)}ms
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default VideoStreamDebugger;
