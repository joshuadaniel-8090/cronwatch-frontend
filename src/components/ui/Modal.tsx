import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const Modal = Dialog;
const ModalTrigger = DialogTrigger;
const ModalClose = DialogClose;
const ModalTitle = DialogTitle;
const ModalDescription = DialogDescription;

function ModalContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        "max-w-md gap-0 rounded-2xl border border-border-card bg-bg-surface p-0 text-text-primary shadow-xl sm:max-w-md",
        className
      )}
      {...props}
    />
  );
}

function ModalHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 px-6 pt-6 pb-2", className)}
      {...props}
    />
  );
}

function ModalBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "custom-scrollbar max-h-[70vh] overflow-y-auto px-6 py-4",
        className
      )}
      {...props}
    />
  );
}

function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 px-6 pt-2 pb-6 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
};
