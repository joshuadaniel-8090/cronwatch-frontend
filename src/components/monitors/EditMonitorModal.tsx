"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INTERVAL_OPTIONS, GRACE_OPTIONS, getErrorMessage } from "@/lib/utils";
import api from "@/lib/api";
import { Monitor } from "@/types";

interface EditMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedMonitor: any) => void;
  monitor: Monitor | null;
}

export function EditMonitorModal({
  isOpen,
  onClose,
  onSuccess,
  monitor,
}: EditMonitorModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [interval, setInterval] = useState(3600);
  const [grace, setGrace] = useState(300);
  const [alertChannel, setAlertChannel] = useState<
    "telegram" | "email" | "both"
  >("email");
  const [tagsInput, setTagsInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (monitor) {
      setName(monitor.name);
      setDescription(monitor.description || "");
      setInterval(monitor.interval_seconds);
      setGrace(monitor.grace_seconds);
      setAlertChannel(monitor.alert_channel || "email");
      setTagsInput(monitor.tags?.join(", ") || "");
      setNameError("");
    }
  }, [monitor, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monitor) return;
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }

    setIsLoading(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const response = await api.put(`monitors/${monitor.id}`, {
        name: name.trim(),
        description: description.trim() || undefined,
        interval_seconds: interval,
        grace_seconds: grace,
        alert_channel: alertChannel,
        tags,
      });
      toast.success("Monitor updated successfully");
      onSuccess(response.data);
      onClose();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent showCloseButton>
        <ModalHeader>
          <ModalTitle>Edit Monitor</ModalTitle>
        </ModalHeader>

        <form id="edit-monitor-form" onSubmit={handleSubmit}>
          <ModalBody className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider">
                Display Name
              </label>
              <Input
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="e.g. Production API Heartbeat"
                aria-invalid={!!nameError}
              />
              {nameError && (
                <p className="text-brand-error text-[10px] ml-1">
                  {nameError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  Interval
                </label>
                <Select
                  value={String(interval)}
                  onValueChange={(v) => setInterval(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  Grace Period
                </label>
                <Select
                  value={String(grace)}
                  onValueChange={(v) => setGrace(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRACE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider">
                Alert Channel
              </label>
              <Select
                value={alertChannel}
                onValueChange={(v) => setAlertChannel(v as typeof alertChannel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider">
                Description (Optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this monitor tracks..."
                className="h-20 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider">
                Tags
              </label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="production, api, priority (comma separated)"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
