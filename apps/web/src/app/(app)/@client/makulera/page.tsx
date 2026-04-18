'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSafeQuery, useSafeMutation } from '@/lib/hooks';
import { api } from '@convex/_generated/api';
import { Search01FreeIcons, CheckmarkCircle02FreeIcons, CancelSquareFreeIcons, ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components';
import { toast } from 'sonner';
import { Id } from '@convex/_generated/dataModel';

type CanceledViolation = {
  _id: Id<'canceledViolations'>;
  reference: string;
  cause: 'MAKULERA' | 'FELPARKERING';
  resolved: boolean;
  parkingId: Id<'parkings'>;
  createdAt?: number;
  notes?: string;
};

export default function MakuleraPage() {
  const router = useRouter();
  const [checkingReference, setCheckingReference] = useState('');

  const violations = useSafeQuery(api.canceledViolations.getByMyParkingIdAndCause, {
    cause: 'MAKULERA',
  });
  const myParking = useSafeQuery(api.parkings.getMyParking);
  const createViolation = useSafeMutation(api.canceledViolations.create);

  const violationList = violations || [];
  const parking = myParking?.parking;
  const isLoading = violations === undefined;

  const handleCheck = async () => {
    if (!checkingReference) {
      toast.error('Ange ett registreringsnummer');
      return;
    }

    // Check if vehicle already exists in violations
    const exists = violationList.some(
      (v: CanceledViolation) => v.reference.toLowerCase() === checkingReference.toLowerCase()
    );

    if (exists) {
      toast.info('Detta fordon är redan registrerat som makulerat');
      return;
    }

    if (!parking) {
      toast.error('Kunde inte hitta din parkering');
      return;
    }

    const result = await createViolation({
      reference: checkingReference.toUpperCase(),
      cause: 'MAKULERA',
      resolved: false,
      parkingId: parking._id,
    });

    if (result) {
      toast.success('Fordon har makulerats');
      setCheckingReference('');
    } else {
      toast.error('Kunde inte makulera fordonet');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString('sv-SE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-muted/50">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center text-card-foreground gap-3 w-fit bg-primary/10 rounded-full p-2 pr-5  hover:bg-primary/50">
              <button
                onClick={() => router.push('/parkering')}
                className="flex items-center justify-center bg-primary/20 rounded-full p-1"
              >
                <HugeiconsIcon icon={ArrowLeft01FreeIcons} className='w-6 h-6' />
              </button>
              <div>
                <h1 className="text-sm font-medium ">Makulera</h1>
                <p className="text-xs text-muted-foreground">Registrera makulerade fordon</p>
              </div>
            </div>
            <ModeToggle />
          </div>

          {/* Registration Input Card */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-2xl p-5 border border-orange-200">
            <label className="block text-sm font-semibold text-card-foreground mb-3">
              Registreringsnummer
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <HugeiconsIcon icon={Search01FreeIcons} className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="ABC123"
                  value={checkingReference}
                  onChange={(e) => setCheckingReference(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  className="pl-10 bg-card border-orange-200 h-12 text-lg font-semibold tracking-wider"
                />
              </div>
              <Button
                onClick={handleCheck}
                disabled={!checkingReference}
                className="bg-orange-600 hover:bg-orange-700 px-6 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HugeiconsIcon icon={CheckmarkCircle02FreeIcons} className="w-5 h-5 mr-2" />
                Lägg till
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : violationList.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HugeiconsIcon icon={CancelSquareFreeIcons} className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Inga makulerade fordon
            </h3>
            <p className="text-sm text-muted-foreground">
              Registrera ett fordon som makulerat genom att ange registreringsnumret ovan
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {violationList.length} {violationList.length === 1 ? 'fordon' : 'fordon'} registrerade
              </h2>
            </div>
            {violationList.map((violation: CanceledViolation) => (
              <div
                key={violation._id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover: transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <HugeiconsIcon icon={CancelSquareFreeIcons} className="w-6 h-6 text-orange-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-card-foreground mb-1">
                        {violation.reference.toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDate(violation.createdAt)}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          MAKULERAD
                        </span>
                      </div>
                    </div>

                    {/* Success Checkmark */}
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
