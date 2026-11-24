import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutOptions {
  onOpenCommandPalette: () => void;
}

export function useKeyboardShortcuts({ onOpenCommandPalette }: ShortcutOptions) {
  const navigate = useNavigate();

  useEffect(() => {
    let pendingKey = '';
    let pendingTimeout: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Cmd+K or Ctrl+K for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      // Vim-style navigation: 'g' then key
      if (pendingKey === 'g') {
        clearTimeout(pendingTimeout);
        pendingKey = '';
        if (e.key === 'o') {
          e.preventDefault();
          navigate('/overview');
        } else if (e.key === 'l') {
          e.preventDefault();
          navigate('/live-monitor');
        } else if (e.key === 'e') {
          e.preventDefault();
          navigate('/experiments');
        } else if (e.key === 'd') {
          e.preventDefault();
          navigate('/devices');
        } else if (e.key === 'c') {
          e.preventDefault();
          navigate('/evidence');
        } else if (e.key === 'f') {
          e.preventDefault();
          navigate('/glitch');
        } else if (e.key === 't') {
          e.preventDefault();
          navigate('/timing');
        } else if (e.key === 's') {
          e.preventDefault();
          navigate('/settings');
        }
        return;
      }

      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        pendingKey = 'g';
        pendingTimeout = setTimeout(() => {
          pendingKey = '';
        }, 800);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(pendingTimeout);
    };
  }, [navigate, onOpenCommandPalette]);
}
