# Voice and Video Call Implementation

## Overview
This document outlines the complete implementation of voice and video call functionality integrated into the existing chat system. The implementation includes WebRTC-based real-time communication, consultation scheduling, and comprehensive call management.

## Features Implemented

### 1. Voice Calls
- **Immediate Connection**: Users can start voice calls directly without scheduling
- **Real-time Audio**: WebRTC-based peer-to-peer audio communication
- **Call Controls**: Mute/unmute, speaker toggle, end call
- **Call Status**: Connection status, call duration, quality indicators

### 2. Video Calls (Consultations)
- **Consultation Requests**: Video calls are treated as consultation requests
- **Scheduling System**: Lawyers must schedule consultation times
- **Meeting Links**: Automatic generation of meeting links
- **Video Controls**: Camera on/off, mute/unmute, fullscreen mode

### 3. Real-time Notifications
- **Incoming Call Alerts**: Toast notifications and modal interfaces
- **Call Status Updates**: Real-time status changes via Socket.io
- **Browser Notifications**: Native browser notification support
- **Consultation Updates**: Status changes for scheduled consultations

## Technical Architecture

### Frontend Components

#### Core Services
- `webrtc.js`: WebRTC service for peer-to-peer communication
- `useWebRTC.js`: React hook for WebRTC state management
- `api.js`: Extended with call and consultation APIs

#### UI Components
- `VoiceCallInterface.jsx`: Voice call modal with audio controls
- `VideoCallInterface.jsx`: Video call interface with video controls
- `ConsultationScheduleModal.jsx`: Scheduling form for video consultations
- `IncomingCallNotification.jsx`: Incoming call notification component
- `CallManager.jsx`: Global call state management
- `CallNotificationToast.jsx`: Toast notifications for call events

#### Enhanced Components
- `ChatHeader.jsx`: Updated with functional call buttons
- `App.jsx`: Integrated CallManager for global call handling

### Backend Implementation

#### Models
- `Call.js`: Call history and management model
- `Consultation.js`: Enhanced consultation model (existing)

#### Controllers
- `callController.js`: Call initiation, answer, reject, end operations
- `consultationController.js`: Consultation scheduling and management

#### Routes
- `/api/calls/*`: Call management endpoints
- `/api/consultations/*`: Consultation management endpoints

#### Socket.io Events
- WebRTC signaling events (offer, answer, ICE candidates)
- Call status events (incoming, answered, ended, rejected)
- Consultation events (requests, confirmations, cancellations)

## User Workflows

### Voice Call Workflow
1. **Initiation**: User clicks phone button in chat header
2. **WebRTC Setup**: Local media stream acquired, peer connection created
3. **Signaling**: Call offer sent via Socket.io to target user
4. **Notification**: Target user receives incoming call notification
5. **Answer/Reject**: Target user can answer or reject the call
6. **Connection**: WebRTC peer connection established
7. **Call Interface**: Voice call modal with controls displayed
8. **End Call**: Either user can end the call

### Video Consultation Workflow
1. **Request**: Citizen clicks video button (labeled "Consultation")
2. **Scheduling Modal**: Form to select date, time, duration, description
3. **API Request**: Consultation request sent to backend
4. **Lawyer Notification**: Lawyer receives consultation request notification
5. **Lawyer Response**: Lawyer can confirm, reschedule, or reject
6. **Meeting Link**: System generates meeting link upon confirmation
7. **Notification**: Citizen receives confirmation with meeting details
8. **Video Call**: At scheduled time, video call can be initiated

## API Endpoints

### Call Management
- `POST /api/calls/initiate` - Start a new call
- `PATCH /api/calls/:callId/answer` - Answer an incoming call
- `PATCH /api/calls/:callId/reject` - Reject an incoming call
- `PATCH /api/calls/:callId/end` - End an active call
- `GET /api/calls/history` - Get call history
- `GET /api/calls/active` - Get active calls
- `GET /api/calls/stats` - Get call statistics

### Consultation Management
- `POST /api/consultations/request` - Create consultation request
- `GET /api/consultations` - Get user's consultations
- `GET /api/consultations/:id` - Get specific consultation
- `PATCH /api/consultations/:id/status` - Update consultation status
- `PATCH /api/consultations/:id/cancel` - Cancel consultation

## Socket.io Events

### WebRTC Signaling
- `webrtc_call_offer` - Send call offer
- `webrtc_call_answer` - Send call answer
- `webrtc_call_reject` - Reject call
- `webrtc_call_end` - End call
- `webrtc_signal` - WebRTC signaling data
- `webrtc_ice_candidate` - ICE candidate exchange

### Call Status Events
- `incoming_call` - Incoming call notification
- `call_answered` - Call was answered
- `call_ended` - Call was ended
- `call_rejected` - Call was rejected

### Consultation Events
- `new_consultation_request` - New consultation request
- `consultation_status_updated` - Consultation status changed
- `consultation_cancelled` - Consultation was cancelled

## Testing Guide

### Prerequisites
1. Two browser windows/tabs or different devices
2. Camera and microphone permissions granted
3. Both users logged in with different roles (citizen/lawyer)
4. Active chat between the users

### Voice Call Testing
1. **Basic Call Flow**:
   - Open chat between two users
   - Click phone button in chat header
   - Verify incoming call notification appears for target user
   - Answer the call and verify audio connection
   - Test mute/unmute functionality
   - End the call and verify proper cleanup

2. **Edge Cases**:
   - Test call rejection
   - Test call timeout (no answer)
   - Test network disconnection during call
   - Test multiple simultaneous call attempts

### Video Consultation Testing
1. **Consultation Request Flow**:
   - Citizen clicks video button in chat with lawyer
   - Fill out consultation scheduling form
   - Verify lawyer receives notification
   - Lawyer confirms consultation
   - Verify citizen receives confirmation

2. **Video Call Flow**:
   - At scheduled time, initiate video call
   - Test video controls (camera on/off, mute)
   - Test fullscreen mode
   - Test call quality and connection

### Browser Compatibility
- Chrome (recommended for WebRTC)
- Firefox
- Safari (limited WebRTC support)
- Edge

## Security Considerations

### WebRTC Security
- STUN servers for NAT traversal
- Encrypted peer-to-peer communication
- No media data passes through server

### API Security
- JWT authentication required for all endpoints
- User authorization checks for call participants
- Rate limiting on call initiation

### Privacy
- Call history stored with participant consent
- Media streams not recorded by default
- Consultation scheduling requires explicit consent

## Performance Optimizations

### Frontend
- Lazy loading of call components
- Efficient WebRTC connection management
- Optimized re-renders with React hooks

### Backend
- Database indexing for call queries
- Efficient Socket.io room management
- Call cleanup and garbage collection

## Deployment Notes

### Environment Variables
- `CLIENT_URL`: Frontend URL for CORS
- `SOCKET_TIMEOUT`: Socket connection timeout
- `CALL_TIMEOUT`: Maximum call duration

### Dependencies
- Frontend: `simple-peer`, `uuid`, `react-webcam`
- Backend: `uuid`, `socket.io`

### Browser Permissions
- Microphone access required for voice calls
- Camera access required for video calls
- Notification permission for call alerts

## Future Enhancements

### Planned Features
- Group video calls
- Screen sharing
- Call recording (with consent)
- Call quality analytics
- Integration with calendar systems
- Mobile app support

### Technical Improvements
- TURN server for better connectivity
- Adaptive bitrate for video calls
- Call quality monitoring
- Advanced noise cancellation
- Bandwidth optimization

## Troubleshooting

### Common Issues
1. **No audio/video**: Check browser permissions
2. **Connection failed**: Verify STUN server configuration
3. **Call not connecting**: Check firewall/NAT settings
4. **Poor quality**: Check network bandwidth

### Debug Tools
- Browser developer tools for WebRTC debugging
- Socket.io connection monitoring
- Call logs in backend
- Frontend console logging

## Conclusion

The voice and video call implementation provides a comprehensive real-time communication solution integrated seamlessly with the existing chat system. The architecture supports both immediate voice calls and scheduled video consultations, with proper role-based access control and real-time notifications.

The system is designed to be scalable, secure, and user-friendly, providing a professional-grade communication platform for the legal consultation use case.
