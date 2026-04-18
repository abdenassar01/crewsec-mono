'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AddCircleFreeIcons } from '@hugeicons/core-free-icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    reference: string;
    name: string;
    joinDate: number;
    leaveDate: number;
  }) => void | Promise<void>;
}

export function AddVehicleDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddVehicleDialogProps) {
  const [reference, setReference] = useState('');
  const [name, setName] = useState('');
  const [joinDate, setJoinDate] = useState<number | undefined>(undefined);
  const [leaveDate, setLeaveDate] = useState<number | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reference || !joinDate || !leaveDate) {
      return;
    }

    if (leaveDate <= joinDate) {
      alert('Slutdatum måste vara efter startdatum');
      return;
    }

    await onSubmit({
      reference: reference.toUpperCase(),
      name: name || reference.toUpperCase(),
      joinDate,
      leaveDate,
    });

    // Reset form
    setReference('');
    setName('');
    setJoinDate(undefined);
    setLeaveDate(undefined);
  };

  const previewData = reference || joinDate || leaveDate ? {
    reference: reference.toUpperCase() || 'XXX000',
    joinDate: joinDate || Date.now(),
    leaveDate: leaveDate || Date.now() + 7 * 24 * 60 * 60 * 1000,
  } : null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('sv-SE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        {/* Vehicle Preview */}
        {previewData && (
          <div className="bg-gray-100 p-4 border-b">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-600">
                    {previewData.reference}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </div>
                      <span>{formatDate(previewData.joinDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                      <span>{formatDate(previewData.leaveDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reference">Registreringsnummer</Label>
            <Input
              id="reference"
              type="text"
              placeholder="Registreringsnummer"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              className="bg-gray-50 border-0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Namn (valfritt)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Fordonets namn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-50 border-0"
            />
          </div>

          <div className="space-y-2">
            <Label>Datum</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <DatePicker
                  value={joinDate}
                  onChange={setJoinDate}
                  placeholder="Startdatum"
                />
                <p className="text-xs text-gray-500 mt-1">Från</p>
              </div>
              <div>
                <DatePicker
                  value={leaveDate}
                  onChange={setLeaveDate}
                  placeholder="Slutdatum"
                />
                <p className="text-xs text-gray-500 mt-1">Till</p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <HugeiconsIcon icon={AddCircleFreeIcons} className="w-5 h-5 mr-2" />
            Skicka
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
