import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const Mascot = () => (
  <div className="mascot-avatar" title="AI Bot">🤖</div>
);

const Navbar = ({ onAuthClick }) => (
  <nav className="navbar glass animated-navbar">
    <div className="navbar-logo gradient-text animated-logo">
      InterViewBot
      <div className="tagline">AI Interview Coach</div>
    </div>
    <div className="navbar-links">
      <a href="#how-to-use" className="nav-btn">How to Use</a>
      <a href="#why-use" className="nav-btn">Why Use?</a>
      <a href="#contact" className="nav-btn">Contact</a>
      {/* Optional: <button className="nav-btn" onClick={onAuthClick}>Log In / Sign Up</button> */}
    </div>
  </nav>
);

const steps = [
  {
    icon: '🟢',
    title: 'Start',
    desc: 'Click Start Interview to begin.'
  },
  {
    icon: '📄',
    title: 'Upload',
    desc: 'Upload your resume (PDF).'
  },
  {
    icon: '💬',
    title: 'Chat',
    desc: 'Answer AI questions in chat.'
  },
  {
    icon: '💾',
    title: 'Save/View',
    desc: 'Sign up only to save or view chats.'
  }
];

const benefits = [
  {
    icon: '⚡',
    title: 'Fast & Adaptive',
    desc: 'Instant, personalized interview questions based on your resume.'
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    desc: 'Your data is safe. No sign up needed unless you want to save chats.'
  },
  {
    icon: '🌎',
    title: 'Practice Anywhere',
    desc: 'Accessible on any device, anytime.'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-bg-v2">
      <Navbar />
      <div className="hero-v2 animated-hero">
        <div className="hero-content">
          <Mascot />
          <h1 className="hero-title-v2 gradient-text animated-hero-title">Ace Your Interview with AI</h1>
          <p className="hero-subtitle-v2 animated-hero-sub">Upload your resume and practice technical interviews with smart, adaptive questions.</p>
          <button className="start-btn-v2 animated-hero-btn" onClick={() => navigate('/interview')}>
            <span role="img" aria-label="rocket">🚀</span> Start Interview
          </button>
        </div>
        <div className="bg-shapes">
          <div className="circle circle1"></div>
          <div className="circle circle2"></div>
          <div className="circle circle3"></div>
        </div>
      </div>
      <div className="wavy-divider">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="url(#paint0_linear)" d="M0,80 C480,160 960,0 1440,80 L1440,120 L0,120 Z"/><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="1440" y2="120" gradientUnits="userSpaceOnUse"><stop stopColor="#43e97b"/><stop offset="1" stopColor="#2575fc"/></linearGradient></defs></svg>
      </div>
      <section className="how-to-use-section-v2" id="how-to-use">
        <h2 className="how-title">How It Works</h2>
        <div className="steps-row">
          {steps.map((step, i) => (
            <div className={`step-card animated-step animated-step-${i}`} key={i}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
        <p className="how-note">No sign up required unless you want to save or view your interview chats!</p>
      </section>
      <section className="why-use-section" id="why-use">
        <h2 className="why-title">Why use InterViewBot?</h2>
        <div className="benefits-row">
          {benefits.map((b, i) => (
            <div className={`benefit-card animated-benefit animated-benefit-${i}`} key={i}>
              <div className="benefit-icon">{b.icon}</div>
              <div className="benefit-title">{b.title}</div>
              <div className="benefit-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>
      <footer className="footer-v2">
        <div>© {new Date().getFullYear()} InterViewBot. All rights reserved.</div>
        <div className="footer-socials">
          <a href="https://twitter.com/" className="footer-link" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://linkedin.com/" className="footer-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 