import { useState } from 'react';

interface ModalItem {
  title: string;
  description: string;
}

interface UseModalReturnType {
  isModalOpen: boolean;
  modalContent: ModalItem | null;
  openModal: (content: ModalItem) => void;
  closeModal: () => void;
}

export const useModal = (): UseModalReturnType => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalItem | null>(null);

  const openModal = (content: ModalItem): void => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  return {
    isModalOpen,
    modalContent,
    openModal,
    closeModal
  };
};
