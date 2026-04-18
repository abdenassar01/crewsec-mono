'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSafeQuery, useSafeMutation } from '@/lib/hooks';
import { api } from '@convex/_generated/api';
import { Add01FreeIcons, Search01FreeIcons, Car01FreeIcons, ArrowLeft01FreeIcons, CheckmarkCircle02FreeIcons, AlertCircleFreeIcons, Delete01FreeIcons } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components';
import { AddVehicleDialog } from './add-vehicle-dialog';
import { toast } from 'sonner';
import { Id } from '@convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Vehicle = {
  _id: Id<'vehicles'>;
  reference: string;
  name: string;
  joinDate: number;
  leaveDate: number;
  parkingId: Id<'parkings'>;
};

export default function PTillstandPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmVehicle, setDeleteConfirmVehicle] = useState<Vehicle | null>(null);

  const vehicles = useSafeQuery(api.vehicles.getMyVehicles, {
    query: searchQuery || undefined,
  });
  const createVehicle = useSafeMutation(api.vehicles.createMyVehicle);
  const deleteVehicle = useSafeMutation(api.vehicles.deleteMyVehicle);

  const handleDeleteVehicle = async () => {
    if (!deleteConfirmVehicle) return;
    const result = await deleteVehicle({ id: deleteConfirmVehicle._id });
    if (result) {
      toast.success('Fordon har tagits bort');
      setDeleteConfirmVehicle(null);
    } else {
      toast.error('Kunde inte ta bort fordon');
    }
  };

  const vehicleList = vehicles || [];
  const isLoading = vehicles === undefined;

  const handleAddVehicle = async (data: {
    reference: string;
    name: string;
    joinDate: number;
    leaveDate: number;
  }) => {
    const result = await createVehicle(data);

    if (result) {
      toast.success('Fordon har lagts till');
      setIsAddDialogOpen(false);
    } else {
      toast.error('Kunde inte lägga till fordon');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('sv-SE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isActive = (leaveDate: number) => {
    return leaveDate > Date.now();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-muted/50 pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-card-foreground gap-3 w-fit bg-primary/10 rounded-full p-2 pr-5  hover:bg-primary/50">
              <button
                onClick={() => router.push('/parkering')}
                className="flex items-center justify-center bg-primary/20 rounded-full p-1"
              >
                <HugeiconsIcon icon={ArrowLeft01FreeIcons} className='w-6 h-6' />
              </button>
              <div>
                <h1 className="text-sm font-medium ">P-tillstånd</h1>
                <p className="text-xs text-muted-foreground">Hantera dina parkeringstillstånd</p>
              </div>
            </div>
            <ModeToggle />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <HugeiconsIcon icon={Search01FreeIcons} className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Sök registreringsnummer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              className="pl-10 bg-muted border-border h-11"
            />
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
        ) : vehicleList.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HugeiconsIcon icon={Car01FreeIcons} className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              {searchQuery ? 'Inga resultat' : 'Inga fordon registrerade'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery
                ? 'Prova att söka efter ett annat registreringsnummer'
                : 'Lägg till ditt första fordon för att komma igång'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <HugeiconsIcon icon={Add01FreeIcons} className="w-5 h-5 mr-2" />
                Lägg till fordon
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {vehicleList.map((vehicle: Vehicle) => (
              <div
                key={vehicle._id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover: transition-shadow"
              >
                {/* Swedish License Plate Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                  <div className="flex items-center gap-4">
                    {/* Blue section with S */}
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-800 rounded-lg border-2 border-blue-500">
                      <span className="text-yellow-400 font-black text-2xl">S</span>
                    </div>
                    {/* Plate number */}
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-black text-white tracking-wider" style={{ fontVariant: 'tabular-nums' }}>
                        {vehicle.reference.toUpperCase()}
                      </h3>
                      {vehicle.name && vehicle.name !== vehicle.reference.toUpperCase() && (
                        <p className="text-blue-100 text-sm mt-0.5">{vehicle.name}</p>
                      )}
                    </div>
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive(vehicle.leaveDate)
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }`}>
                      {isActive(vehicle.leaveDate) ? (
                        <HugeiconsIcon icon={CheckmarkCircle02FreeIcons} className="w-6 h-6 text-white" />
                      ) : (
                        <HugeiconsIcon icon={AlertCircleFreeIcons} className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  {/* Status indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isActive(vehicle.leaveDate) ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        isActive(vehicle.leaveDate) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                      }`}>
                        {isActive(vehicle.leaveDate) ? 'Aktivt parkeringstillstånd' : 'Utgånget tillstånd'}
                      </span>
                    </div>
                    <button
                      onClick={() => setDeleteConfirmVehicle(vehicle)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Ta bort fordon"
                    >
                      <HugeiconsIcon icon={Delete01FreeIcons} className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span>Startdatum</span>
                      </div>
                      <p className="text-sm font-semibold text-card-foreground">{formatDate(vehicle.joinDate)}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span>Slutdatum</span>
                      </div>
                      <p className={`text-sm font-semibold ${
                        isActive(vehicle.leaveDate) ? 'text-card-foreground' : 'text-muted-foreground'
                      }`}>{formatDate(vehicle.leaveDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {!isLoading && (
        <div className="fixed bottom-6 right-6 z-20">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="icon"
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700   transition-all hover:scale-105"
          >
            <HugeiconsIcon icon={Add01FreeIcons} className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Add Vehicle Dialog */}
      <AddVehicleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddVehicle}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmVehicle} onOpenChange={(open) => !open && setDeleteConfirmVehicle(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ta bort fordon</DialogTitle>
            <DialogDescription>
              Är du säker på att du vill ta bort fordonet med registreringsnummer{' '}
              <span className="font-semibold text-foreground">{deleteConfirmVehicle?.reference.toUpperCase()}</span>?
              Denna åtgärd kan inte ångras.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmVehicle(null)}>
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleDeleteVehicle}>
              Ta bort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
