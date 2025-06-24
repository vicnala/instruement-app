import React from 'react';

interface ModalItem {
  title: string;
  description: string;
}

interface ModalProps {
  isOpen: boolean;
  content: ModalItem | null;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, content, onClose }) => {
  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="relative z-10 mx-4 px-4 py-6 border w-96 border-none rounded-md bg-white">
        <div className="text-left">
          <h2 className='text-xl font-bold mb-4 text-gray-900'>{content.title}</h2>
          <p className='text-sm text-gray-600'>{content.description}</p>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="text-black background-transparent font-bold uppercase px-0 py-0 text-sm outline-none focus:outline-none ease-linear transition-all duration-150" type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              height="3em"
              width="3em"
              className="text-me-500"
            >
              <path d="M17.28 9.28a.75.75 0 00-1.06-1.06l-5.97 5.97-2.47-2.47a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l6.5-6.5z" />
              <path fillRule="evenodd" d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zM2.5 12a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z" />
            </svg>
          </button>
        </div>

      </div>
      <div onClick={onClose} className='absolute z-1 top-0 bottom-0 w-full'></div>
    </div>
  );
};

export default Modal;
