import React from 'react';
import Navbar from './Navbar';
import Footer from './common/Footer';
import NotificationSystem from './NotificationSystem';

const Layout = ({ children, showNavbar = true, showFooter = false, showNotificationSystem = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {showNavbar && <Navbar />}

        <main className="flex-1 w-full max-w-full">
          {children}
        </main>

        {showFooter && <Footer />}
      </div>

      {/* Notification System */}
      {showNotificationSystem && <NotificationSystem />}
    </div>
  );
};

export default Layout;