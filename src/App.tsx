/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, X, Sparkles, Image as ImageIcon, Camera } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Note {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  timestamp: string;
  image?: string;
}

const NOTE_COLORS = [
  'bg-yellow-100',
  'bg-orange-100',
  'bg-amber-100',
  'bg-rose-100',
  'bg-emerald-100',
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isClearing, setIsClearing] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('piggy-notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notes', e);
      }
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('piggy-notes', JSON.stringify(notes));
  }, [notes]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setSelectedImage(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const addNote = () => {
    if (!inputValue.trim() && !selectedImage) return;
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const newNote: Note = {
      id: crypto.randomUUID(),
      text: inputValue,
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      x: Math.random() * 40 - 20, // Random slight offset
      y: Math.random() * 40 - 20,
      timestamp,
      image: selectedImage || undefined,
    };
    setNotes([newNote, ...notes]);
    setInputValue('');
    setSelectedImage(null);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const clearAllNotes = () => {
    if (notes.length === 0 && !inputValue && !selectedImage) return;
    
    // Visual feedback instead of blocking confirm
    setIsClearing(true);
    setNotes([]);
    setInputValue('');
    setSelectedImage(null);
    
    setTimeout(() => {
      setIsClearing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] flex flex-col items-center py-12 px-4 font-sans selection:bg-amber-200">
      {/* Header / Piggy Bank Container */}
      <div className="relative w-full max-w-2xl flex flex-col items-center">
        
        {/* The Golden Piggy Head */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            x: isClearing ? [0, -10, 10, -10, 10, 0] : 0
          }}
          transition={{ duration: isClearing ? 0.4 : 0.5 }}
          className="relative w-64 h-64 bg-gradient-to-b from-amber-300 to-amber-500 rounded-full shadow-2xl border-8 border-amber-600 flex flex-col items-center justify-center overflow-visible z-10"
        >
          {/* Ears */}
          <div className="absolute -top-4 -left-4 w-16 h-16 bg-amber-500 rounded-tl-full border-t-4 border-l-4 border-amber-600 rotate-[-15deg]" />
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-500 rounded-tr-full border-t-4 border-r-4 border-amber-600 rotate-[15deg]" />

          {/* Eyes */}
          <div className="flex gap-12 mb-4">
            <div className="w-4 h-6 bg-stone-800 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="w-4 h-6 bg-stone-800 rounded-full animate-bounce" style={{ animationDuration: '3.2s' }} />
          </div>

          {/* The Nose (Clear Button) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={clearAllNotes}
            title="Click my nose to clear all notes!"
            className={cn(
              "group relative w-24 h-16 rounded-full border-4 flex items-center justify-center gap-4 shadow-inner cursor-pointer z-20 transition-colors duration-300",
              isClearing ? "bg-rose-400 border-rose-500" : "bg-rose-300 border-rose-400"
            )}
          >
            {/* Nostrils */}
            <div className={cn("w-3 h-5 rounded-full transition-colors", isClearing ? "bg-rose-600" : "bg-rose-500/40")} />
            <div className={cn("w-3 h-5 rounded-full transition-colors", isClearing ? "bg-rose-600" : "bg-rose-500/40")} />
            
            {/* Tooltip hint */}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isClearing ? "Cleared!" : "Clear All Notes"}
            </span>
          </motion.button>

          {/* Cheeks */}
          <div className="absolute top-32 left-8 w-8 h-4 bg-rose-200/50 blur-sm rounded-full" />
          <div className="absolute top-32 right-8 w-8 h-4 bg-rose-200/50 blur-sm rounded-full" />
        </motion.div>

        {/* Input Area */}
        <div className="mt-12 w-full max-w-md flex flex-col gap-4">
          {selectedImage && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-amber-200 bg-white group"
            >
              <img src={selectedImage} className="w-full h-full object-cover" alt="Selected" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
                onPaste={handlePaste}
                placeholder="Write a memo or paste image..."
                className="w-full px-6 py-4 bg-white border-2 border-amber-200 rounded-2xl shadow-sm focus:outline-none focus:border-amber-500 text-stone-700 placeholder:text-stone-400 pr-12"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-amber-500 transition-colors"
                title="Upload image"
              >
                <ImageIcon size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <button
              onClick={addNote}
              className="p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-lg transition-colors flex items-center justify-center"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="mt-16 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
                animate={{ scale: 1, opacity: 1, rotate: note.x / 10 }}
                exit={{ scale: 0.5, opacity: 0 }}
                whileHover={{ y: -5, rotate: 0 }}
                className={cn(
                  "relative p-6 min-h-[160px] rounded-xl shadow-md border border-black/5 flex flex-col justify-between",
                  note.color
                )}
              >
                {/* Pin effect */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-600 rounded-full shadow-sm border-2 border-amber-700" />
                
                <div className="flex flex-col gap-3">
                  {note.image && (
                    <div className="w-full rounded-lg overflow-hidden border border-black/5">
                      <img src={note.image} className="w-full h-auto object-cover max-h-48" alt="Note attachment" />
                    </div>
                  )}
                  <p className="text-stone-800 font-medium leading-relaxed break-words">
                    {note.text}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-[10px] text-stone-500 font-mono opacity-70">
                    {note.timestamp}
                  </span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-2 text-stone-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {notes.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-stone-400 flex flex-col items-center gap-2"
          >
            <Sparkles className="text-amber-300" />
            <p>No notes yet. Add one to start your fortune!</p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-20 text-stone-400 text-sm">
        Golden Piggy Notes &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
