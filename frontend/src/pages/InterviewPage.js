/**
 * InterviewPage - WhatsApp/Telegram style: permanent side dashboard, main chat area.
 * Dashboard always shows: 'Current Chat' + all past chats. Clicking loads chat in main area.
 * Input is disabled for past chats. All UI matches branding.
 */
import React, { useRef, useState } from 'react';
import axios from 'axios';
import AuthModal from '../components/AuthModal';
import './InterviewPage.css';

const API = 'http://localhost:8080/api';

// NEW: Toast component for feedback
const Toast = ({ message, onClose }) => (
  message ? (
    <div className="toast">
      {message}
      <button className="toast-close" onClick={onClose}>&times;</button>
    </div>
  ) : null
);

// NEW: Modal for entering session name
const SaveChatModal = ({ open, onSave, onClose }) => {
  const [sessionName, setSessionName] = useState('');
  return open ? (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Name your chat session</h3>
        <input
          className="modal-input"
          type="text"
          placeholder="Session name"
          value={sessionName}
          onChange={e => setSessionName(e.target.value)}
        />
        <div className="modal-actions">
          <button className="modal-btn" onClick={() => { onSave(sessionName); setSessionName(''); }}>Save</button>
          <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  ) : null;
};

const InterviewPage = () => {
  const fileInputRef = useRef();
  const [resumeName, setResumeName] = useState('');
  const [chat, setChat] = useState([
    { sender: 'bot', text: 'Please upload your resume to start the interview.' }
  ]);
  const [input, setInput] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authAction, setAuthAction] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('jwt'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pastChats, setPastChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState('current');
  const [sidebarFocus, setSidebarFocus] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isChatSaved, setIsChatSaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [pendingSessionName, setPendingSessionName] = useState('');

  // NEW: Handle page refresh/navigation warning
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show warning if user has an active chat that hasn't been saved
      // and they're not just on the initial bot message
      const hasActiveChat = chat.length > 1 || (chat.length === 1 && chat[0].sender === 'user');
      const isCurrentChat = selectedChatId === 'current';
      const chatNotSaved = !isChatSaved;
      
      if (hasActiveChat && isCurrentChat && chatNotSaved) {
        const message = 'If you refresh this page, your chat will be lost. Are you sure you want to leave?';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [chat, selectedChatId, isChatSaved]);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchPastChats();
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const fetchPastChats = async () => {
    setLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await axios.get(`${API}/get-chat`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setPastChats(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // ignore error for now
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeName(file.name);
      setLoading(true);
      setError('');
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`${API}/ai/upload-resume`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setChat([{ sender: 'bot', text: res.data }]);
      } catch (err) {
        setError(err.response?.data || 'Failed to upload resume.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    // Only allow sending in Current Chat mode
    if (selectedChatId !== 'current') return;
    setChat([...chat, { sender: 'user', text: input }]);
    setInput('');
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/ai/answer-question`, input, {
        headers: { 'Content-Type': 'text/plain' }
      });
      let botText = res.data;
      if (typeof botText === 'object') {
        botText = botText.text || botText.message || JSON.stringify(botText);
      }
      setChat(c => [...c, { sender: 'bot', text: botText }]);
    } catch (err) {
      setError(err.response?.data || 'Failed to get answer.');
    } finally {
      setLoading(false);
    }
  };

  // Save Chat button click handler: always show modal first
  const handleSaveChatClick = () => {
    setShowSaveModal(true);
  };

  // Called when user submits session name in modal
  const handleSessionNameSubmit = (sessionNameFromModal) => {
    setShowSaveModal(false);
    if (!sessionNameFromModal) return;
    setPendingSessionName(sessionNameFromModal);
    if (isAuthenticated) {
      handleSaveChat(sessionNameFromModal);
    } else {
      setAuthAction('Save Chat');
      setShowAuth(true);
    }
  };

  // After authentication, if we have a pending session name, save chat
  const handleAuth = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    fetchPastChats();
    if (authAction === 'Save Chat' && pendingSessionName) {
      handleSaveChat(pendingSessionName);
      setPendingSessionName('');
    }
  };

  // Only called internally, expects session name
  const handleSaveChat = async (sessionNameFromModal) => {
    if (!sessionNameFromModal) return;
    if (!chat.length) {
      setSaveStatus('Chat is empty.');
      return;
    }
    setLoading(true);
    setError('');
    setSaveStatus('');
    try {
      const jwt = localStorage.getItem('jwt');
      const sessionName = sessionNameFromModal;
      const chatToSave = chat.map(msg => ({ sender: msg.sender, text: msg.text, messageType: msg.messageType }));
      const res = await axios.post(`${API}/save-chat`, {
        sessionName,
        conversation: JSON.stringify(chatToSave),
      }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setSaveStatus('Chat saved successfully!');
      setIsChatSaved(true);
      setToastMsg('Chat saved successfully!');
      fetchPastChats();
    } catch (err) {
      setError(err.response?.data || 'Failed to save chat.');
      setSaveStatus('Failed to save chat.');
      setToastMsg('Failed to save chat.');
    } finally {
      setLoading(false);
      setShowSaveModal(false);
    }
  };

  const handleSelectChat = (id) => {
    if (id === 'current') {
      setSelectedChatId('current');
      setIsChatSaved(false);
      setSaveStatus('');
      return;
    }
    if (!isAuthenticated) {
      setAuthAction('View Past Chats');
      setShowAuth(true);
      return;
    }
    setSelectedChatId(id);
    setSaveStatus('');
    setIsChatSaved(true);
  };

  const handleOpenAuth = () => {
    setAuthAction('Authenticate');
    setShowAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setIsAuthenticated(false);
    setPastChats([]);
    setSelectedChatId('current');
  };

  const handleViewPastChats = () => {
    if (!isAuthenticated) {
      setAuthAction('View Past Chats');
      setShowAuth(true);
      return;
    }
    setSidebarFocus(true);
    // Optionally scroll/focus sidebar
  };

  React.useEffect(() => {
    if (sidebarFocus) {
      const sidebar = document.querySelector('.side-dashboard');
      if (sidebar) sidebar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSidebarFocus(false);
    }
  }, [sidebarFocus]);

  // Helper to filter and clean up chat messages for display
  const getDisplayMessages = (messages) => {
    return messages
      .filter((msg, idx) => {
        // Show if sender is 'bot' or 'user'
        if (msg.sender === 'bot' || msg.sender === 'user') return true;
        // Or if messageType is 'USER' or 'ASSISTANT'
        if (msg.messageType === 'USER' || msg.messageType === 'ASSISTANT') return true;
        return false;
      })
      .map(msg => {
        let text = msg.text;
        // If text is a JSON string, try to parse and extract the actual answer/text
        if (typeof text === 'string') {
          try {
            const parsed = JSON.parse(text);
            if (parsed.text) text = parsed.text;
            else if (parsed.answer) text = parsed.answer;
          } catch (e) {
            // Not JSON, use as is
          }
        }
        if (typeof text === 'object') text = JSON.stringify(text);
        // Map messageType to sender for CSS
        let sender = msg.sender;
        if (!sender && msg.messageType) {
          sender = msg.messageType === 'ASSISTANT' ? 'bot' : 'user';
        }
        return { sender, text };
      });
  };

  // Chat selection logic
  let displayChat = getDisplayMessages(chat);
  let isCurrent = true;
  if (selectedChatId !== 'current') {
    const found = pastChats.find(c => c.sessionId === selectedChatId);
    if (found && Array.isArray(found.conversation)) {
      displayChat = getDisplayMessages(found.conversation);
      isCurrent = false;
    } else if (found && found.conversation && typeof found.conversation === 'object') {
      displayChat = [{ sender: 'bot', text: 'Failed to load chat history: ' + (found.conversation.error || 'Unknown error') }];
      isCurrent = false;
    }
  }

  // NAVBAR matching home page
  const Navbar = () => (
    <nav className="navbar-gradient">
      <div className="navbar-logo-group">
        <span className="navbar-logo">🤖 InterViewBot</span>
        <span className="navbar-tagline">Ace Your Interview with AI</span>
      </div>
      <div className="navbar-links">
        <a href="/" className="nav-link">Home</a>
        <a href="#how-to-use" className="nav-link">How to Use</a>
        <a href="#why-use" className="nav-link">Why Use?</a>
        <a href="#contact" className="nav-link">Contact</a>
      </div>
      <div className="navbar-auth">
        {!isAuthenticated ? (
          <button className="navbar-btn login-btn" onClick={handleOpenAuth}>Log In / Sign Up</button>
        ) : (
          <button className="navbar-btn" onClick={handleLogout}>Log Out</button>
        )}
      </div>
    </nav>
  );

  // FOOTER
  const Footer = () => (
    <footer className="footer-gradient">
      <div>© {new Date().getFullYear()} InterViewBot. All rights reserved.</div>
      <div className="footer-links">
        <a href="#about">About</a> | <a href="#contact">Contact</a>
      </div>
    </footer>
  );

  // Sidebar (collapsible on mobile)
  const Sidebar = () => (
    <aside className="sidebar-gradient">
      <div className="sidebar-header">Past Chats</div>
      <ul className="sidebar-list">
        <li
          className={`sidebar-item${selectedChatId === 'current' ? ' active' : ''}`}
          onClick={() => handleSelectChat('current')}
        >
          <span className="sidebar-icon">💬</span> Current Chat
        </li>
        {!isAuthenticated && (
          <li className="sidebar-empty">Sign in to view and save past chats.</li>
        )}
        {isAuthenticated && pastChats.length === 0 && (
          <li className="sidebar-empty">No past chats found.</li>
        )}
        {isAuthenticated && pastChats.map((session, idx) => (
          <li
            key={session.sessionId || idx}
            className={`sidebar-item${selectedChatId === session.sessionId ? ' active' : ''}`}
            onClick={() => handleSelectChat(session.sessionId)}
          >
            <span className="sidebar-icon">🗂️</span> {session.sessionName || session.sessionId}
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <button className="sidebar-save-btn" onClick={handleSaveChatClick} disabled={loading || !chat.length || isChatSaved}>Save Chat</button>
        {saveStatus && <div className="sidebar-save-status" style={{ color: saveStatus.includes('success') ? '#43e97b' : 'red' }}>{saveStatus}</div>}
      </div>
    </aside>
  );

  // Main chat area
  return (
    <div className="interview-gradient-bg">
      <Navbar />
      <div className="app-shell">
        <aside className="sidebar-perfect">
          <Sidebar />
        </aside>
        <section className="chat-perfect">
          <div className="chat-title-row">
            <span className="chat-title">InterViewBot Chat</span>
            <button className="chat-past-btn" onClick={handleViewPastChats}>View Past Chats</button>
          </div>
          <div className="chat-desc">Upload your resume and practice technical interviews with AI. Save and review your sessions anytime.</div>
          <div className="chat-upload-row">
            <input
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleUpload}
            />
            <button className="chat-upload-btn" onClick={() => fileInputRef.current.click()} disabled={loading}>
              {resumeName ? `Uploaded: ${resumeName}` : 'Upload Resume (PDF)'}
            </button>
          </div>
          <div className="chatbox-modern">
            {displayChat.length === 0 && <div style={{color: '#888'}}>No messages yet.</div>}
            {displayChat.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
            ))}
            {loading && isCurrent && <div className="chat-bubble bot">Loading...</div>}
          </div>
          <div className="chat-input-row-modern unified-chat-input-sticky">
            <input
              className="chat-input-modern"
              type="text"
              placeholder={isCurrent ? 'Type your answer...' : (!isAuthenticated ? 'Sign in to view past chats' : 'Viewing past chat')}
              value={isCurrent ? input : ''}
              onChange={e => isCurrent && setInput(e.target.value)}
              onKeyDown={e => isCurrent && e.key === 'Enter' && handleSend()}
              disabled={loading || !isCurrent}
            />
            <button className="chat-send-btn" onClick={handleSend} disabled={loading || !isCurrent}>Send</button>
          </div>
          {error && <div className="chat-error-modern">{error}</div>}
        </section>
      </div>
      <Footer />
      {showAuth && (
        <AuthModal action={authAction} onClose={() => setShowAuth(false)} onAuth={handleAuth} />
      )}
      <SaveChatModal open={showSaveModal} onSave={handleSessionNameSubmit} onClose={() => setShowSaveModal(false)} />
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
};

export default InterviewPage; 