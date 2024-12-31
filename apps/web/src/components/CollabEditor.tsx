"use client"

import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CollaborativeEditorProps } from './DocumentPage';

const SAVE_INTERVAL = 5000; // Save every 5 seconds



const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ documentId, initialContent = '', onSave }) => {
  const [content, setContent] = useState(initialContent);
  const [cursorPosition, setCursorPosition] = useState({ row: 0, column: 0 });
  const [history, setHistory] = useState([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastSavedContent = useRef(initialContent);

  const { sendMessage, lastMessage } = useWebSocket(documentId);

  useEffect(() => {
    if (!lastMessage) return;

    const data = JSON.parse(lastMessage);
    switch (data.type) {
      case 'EDIT':
        setContent(data.payload.content);
        break;
      case 'CURSOR_MOVE':
        // Update other users' cursors here
        break;
    }
  }, [lastMessage]);

  // Autosave functionality
  useEffect(() => {
    const timer = setInterval(() => {
      if (content !== lastSavedContent.current) {
        sendMessage({
          type: 'SAVE',
          payload: { content }
        });
        lastSavedContent.current = content;
      }
    }, SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [content, sendMessage]);

  const handleChange = (e:any) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Add to history
    if (newContent !== content) {
      const newHistory = [...history.slice(0, historyIndex + 1), newContent];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      sendMessage({
        type: 'EDIT',
        payload: { content: newContent },
        row: cursorPosition.row,
        column: cursorPosition.column
      });
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after indentation
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }

    // Handle undo/redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey && historyIndex < history.length - 1) {
        // Redo
        setHistoryIndex(historyIndex + 1);
        setContent(history[historyIndex + 1]);
      } else if (!e.shiftKey && historyIndex > 0) {
        // Undo
        setHistoryIndex(historyIndex - 1);
        setContent(history[historyIndex - 1]);
      }
    }
  };

  
  const updateCursorPosition = () => {
    if (!textAreaRef.current) return;

    const textBeforeCursor = content.substring(0, textAreaRef.current.selectionStart);
    const lines = textBeforeCursor.split('\n');
    const row = lines.length - 1;
    const column = lines[lines.length - 1].length;

    setCursorPosition({ row, column });
    sendMessage({
      type: 'CURSOR_MOVE',
      row,
      column
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b">
        <button
          onClick={() => {
            if (historyIndex > 0) {
              setHistoryIndex(historyIndex - 1);
              setContent(history[historyIndex - 1]);
            }
          }}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          disabled={historyIndex <= 0}
        >
          Undo
        </button>
        <button
          onClick={() => {
            if (historyIndex < history.length - 1) {
              setHistoryIndex(historyIndex + 1);
              setContent(history[historyIndex + 1]);
            }
          }}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          disabled={historyIndex >= history.length - 1}
        >
          Redo
        </button>
      </div>
      <textarea
        ref={textAreaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={updateCursorPosition}
        className="flex-1 w-full p-4 font-mono text-base resize-none focus:outline-none"
        spellCheck={false}
      />
    </div>
  );
};

export default CollaborativeEditor;