import React from "react";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./modal.scss";
import { Card } from "@/components/card/card";

export type ModalProps = {
  children: React.ReactNode;
  title?: string;
  isOpen: boolean;
  onClose?: () => void;
};

export const Modal: React.FC<ModalProps> = ({
  children,
  title,
  isOpen,
  onClose,
}) => {
  const closeModal = () => {
    if (onClose) {
      onClose();
    }
  };
  return (
    <>
      {isOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal__wrapper">
            <div className="modal__window" onClick={(e) => e.stopPropagation()}>
              <Card title={title}>
                <FontAwesomeIcon
                  className="modal__closer"
                  icon={faCircleXmark}
                  onClick={closeModal}
                />
                {children}
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
