"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const TYPE_STYLES = {
  danger: {
    badge: "bg-brand-error/10 text-brand-error",
    confirmClassName: "bg-brand-error hover:bg-brand-error/90",
  },
  warning: {
    badge: "bg-brand-warning/10 text-brand-warning",
    confirmClassName: "bg-brand-warning hover:bg-brand-warning/90",
  },
  info: {
    badge: "bg-brand-primary/10 text-brand-primary",
    confirmClassName: "",
  },
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
}) => {
  const styles = TYPE_STYLES[type];

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent showCloseButton>
        <ModalHeader>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              styles.badge,
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <p className="text-sm text-text-muted">{message}</p>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={styles.confirmClassName}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
