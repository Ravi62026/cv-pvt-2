import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EmojiPicker = ({ isOpen, onClose, onEmojiSelect, position = 'bottom' }) => {
  const pickerRef = useRef(null);

  // Popular emojis organized by categories
  const emojiCategories = {
    'Smileys': [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔'
    ],
    'Gestures': [
      '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
      '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋',
      '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿'
    ],
    'Hearts': [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'
    ],
    'Objects': [
      '💼', '👑', '🎓', '⚖️', '📱', '💻', '📄', '📋', '📊', '📈',
      '📉', '🗂️', '📁', '📂', '🗃️', '🗄️', '📅', '📆', '🗓️', '📇'
    ],
    'Legal': [
      '⚖️', '👨‍⚖️', '👩‍⚖️', '🏛️', '📜', '📋', '✍️', '🤝', '💼', '👔'
    ]
  };

  const [activeCategory, setActiveCategory] = useState('Smileys');

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        initial={{ opacity: 0, scale: 0.9, y: position === 'bottom' ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: position === 'bottom' ? 10 : -10 }}
        className={`absolute ${position === 'bottom' ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-80 max-h-96 overflow-hidden`}
      >
        {/* Category Tabs */}
        <div className="flex border-b border-white/10 bg-white/5">
          {Object.keys(emojiCategories).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeCategory === category
                  ? 'text-blue-400 bg-blue-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Emoji Grid */}
        <div className="p-3 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {emojiCategories[activeCategory].map((emoji, index) => (
              <motion.button
                key={`${emoji}-${index}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-lg transition-colors"
                title={emoji}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quick Access Row */}
        <div className="border-t border-white/10 bg-white/5 p-2">
          <div className="flex justify-center space-x-1">
            {['👍', '❤️', '😂', '😢', '😮', '😡', '🎉', '🤔'].map((emoji, index) => (
              <motion.button
                key={`quick-${emoji}-${index}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-lg transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmojiPicker;
