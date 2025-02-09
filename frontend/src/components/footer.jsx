import React from 'react';

export default function Footer({ transcript }) {
  return (
    <footer className={`${!transcript ? "fixed" : ""} bottom-0 left-0 right-0 py-8 border-t border-gray-800`}>
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
        <p>Made with ❤️ by Sharan</p>
      </div>
    </footer>
  );
}
