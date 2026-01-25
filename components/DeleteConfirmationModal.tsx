
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
