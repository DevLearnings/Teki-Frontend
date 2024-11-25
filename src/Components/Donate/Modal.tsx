// Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onRequestClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <button className="absolute top-0 right-0 m-4" onClick={onRequestClose}>
          Close
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
