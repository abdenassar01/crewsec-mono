'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Button } from '@/components/ui/button';
import { useSafeAction, useSafeQuery } from '@/lib/hooks';
import {
  CarParking01FreeIcons,
  Alert01FreeIcons,
  AiSecurity03FreeIcons,
  AlertCircleFreeIcons,
  Home04FreeIcons,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { toast } from 'sonner';
import { ModeToggle } from '@/components';
import { ParkingMap } from '@/components';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isSendingAlarm, setIsSendingAlarm] = useState(false);
  const user = useSafeQuery(api.users.getCurrentUserProfile);
  const myParking = useSafeQuery(api.parkings.getMyParking);
  const sendNotification = useSafeAction(api.notifications.sendPushNotificationToManagers);

  const parking = myParking?.parking;

  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.replace('/login');
    }
  }, [user, router]);

  async function handleAlarmSend() {
    setIsSendingAlarm(true);
    try {
      await sendNotification({
        title: 'Larm från parkering',
        body: `Larm utlöst från ${parking?.name || 'din parkering'}`,
      });
      toast.success('Larm har skickats till admin!');
      setIsAlarmModalOpen(false);
    } catch (error) {
      toast.error('Kunde inte skicka larm');
    } finally {
      setIsSendingAlarm(false);
    }
  }

  const statCards = [
    {
      label: 'Makulera',
      value: parking?.unresolvedMakuleras || 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: 'cancel',
      href: '/makulera',
    },
    {
      label: 'Felparkering',
      value: parking?.unresolvedFelparkering || 0,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: 'alert',
      href: '/felparkering',
    },
    {
      label: 'P-tillstånd',
      value: 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: 'calendar',
      href: '/p-tillstand',
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-muted to-muted/50">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
          {/* Header with Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-card-foreground gap-3 w-fit bg-primary/10 rounded-full p-2 pr-5">
              <div className="flex items-center justify-center bg-primary/20 rounded-full p-1">
                <HugeiconsIcon icon={Home04FreeIcons} className='w-5 h-5' />
              </div>
              <div>
                <h1 className="text-sm font-medium">Hem</h1>
                <p className="text-xs text-muted-foreground">Översikt</p>
              </div>
            </div>
            <ModeToggle />
          </div>

          <div className="bg-card rounded-2xl overflow-hidden">
            {parking?.imageUrl && (
              <div className="relative aspect-video w-full">
                {parking.imageUrl && (
                  <img
                    src={parking.imageUrl}
                    alt={parking.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white bg-black/10 backdrop-blur-2xl p-4 rounded-xl">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {parking?.name || 'Min Parkering'}
                    </h1>
                    {parking?.description && (
                      <p className="text-blue-100 mt-2 text-sm md:text-base max-w-lg mx-auto px-4">
                        {parking.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {!parking?.imageUrl && (
              <div className="bg-primary p-8 md:p-12 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-4">
                  <HugeiconsIcon icon={Home04FreeIcons} className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
                  {parking?.name || 'Min Parkering'}
                </h1>
                {parking?.description && (
                  <p className="text-blue-100 mt-2 text-sm md:text-base max-w-lg mx-auto">
                    {parking.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {statCards.map((stat) => (
              <button
                key={stat.label}
                onClick={() => router.push(stat.href as any)}
                className="bg-card rounded-xl border border-border p-4 md:p-6 text-center transition-all hover:scale-[1.02]"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  {stat.icon === 'cancel' && (
                    <CancelSquareFreeIcons className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                  )}
                  {stat.icon === 'alert' && (
                    <HugeiconsIcon icon={AlertCircleFreeIcons} className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                  )}
                  {stat.icon === 'calendar' && (
                    <CalendarIcon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                  )}
                </div>
                <p className={`text-xl md:text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </button>
            ))}
          </div>

          {/* Main Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Parking Management Card */}
            <button
              onClick={() => router.push('/parkering')}
              className="bg-card rounded-2xl border border-border p-6 text-left transition-all group hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <HugeiconsIcon icon={CarParking01FreeIcons} className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground mb-1">Parkering</h3>
                  <p className="text-sm text-muted-foreground">Hantera dina fordon och tillstånd</p>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Alarm Card */}
            <button
              onClick={() => setIsAlarmModalOpen(true)}
              className="bg-card rounded-2xl border border-border p-6 text-left hover: transition-all group hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                    <HugeiconsIcon icon={Alert01FreeIcons} className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground mb-1">Skicka Larm</h3>
                  <p className="text-sm text-muted-foreground">Utlös larm till administratör</p>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {(parking?.location || parking?.address) && (
            <div className="bg-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <HugeiconsIcon icon={AiSecurity03FreeIcons} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-card-foreground">Karta</h2>
                    {parking?.address && (
                      <p className="text-sm text-muted-foreground mt-0.5">{parking.address}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <ParkingMap
                  location={parking.location}
                  address={parking.address}
                  className="w-full"
                />
                {parking?.location && (
                  <div className="mt-3">
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(parking.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Öppna i Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alarm Confirmation Modal */}
      <Dialog open={isAlarmModalOpen} onOpenChange={setIsAlarmModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HugeiconsIcon icon={Alert01FreeIcons} className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl">Skicka Larm</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Är du säker på att du vill utlösa ett larm till administratör?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsAlarmModalOpen(false)}
              disabled={isSendingAlarm}
              className="w-full sm:w-auto"
            >
              Avbryt
            </Button>
            <Button
              onClick={handleAlarmSend}
              disabled={isSendingAlarm}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {isSendingAlarm ? 'Skickar...' : 'Skicka Larm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Import CancelSquareFreeIcons for stats
function CancelSquareFreeIcons(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9l6 6m0-6l-6 6" />
    </svg>
  );
}

// CalendarIcon for P-tillstånd stat
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
}
