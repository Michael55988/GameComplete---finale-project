import { useEffect } from 'react';
import './Toast.css';

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`gc-toast gc-toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="gc-toast-close" aria-label="Close">
        ×
      </button>
    </div>
  );
}

export default Toast;
