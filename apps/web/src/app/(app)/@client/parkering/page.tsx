'use client';

import { useRouter } from 'next/navigation';
import { useSafeQuery } from '@/lib/hooks';
import { api } from '@convex/_generated/api';
import {
  Car01FreeIcons,
  CancelSquareFreeIcons,
  AlertCircleFreeIcons,
  Globe02FreeIcons,
  CarParking01FreeIcons,
  Home02FreeIcons,
  ArrowLeft01FreeIcons,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components';

export default function ParkingManagementPage() {
  const router = useRouter();
  const myParking = useSafeQuery(api.parkings.getMyParking);
  const parking = myParking?.parking;
  const user = myParking?.user;

  const actionCards = [
    {
      title: 'P-tillstånd',
      description: 'Hantera parkeringstillstånd',
      icon: Car01FreeIcons,
      color: 'blue',
      href: '/p-tillstand',
      bgIcon: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Makulera',
      description: 'Makulera fordon',
      icon: CancelSquareFreeIcons,
      color: 'orange',
      href: '/makulera',
      bgIcon: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Felparkering',
      description: 'Rapportera felparkering',
      icon: AlertCircleFreeIcons,
      color: 'red',
      href: '/felparkering',
      bgIcon: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-muted/50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-card-foreground gap-3 w-fit bg-primary/10 rounded-full p-2 pr-5  hover:bg-primary/50">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center bg-primary/20 rounded-full p-1"
            >
              <HugeiconsIcon icon={ArrowLeft01FreeIcons} className='w-6 h-6' />
            </button>
            <div>
              <h1 className="text-sm font-medium ">Parkering</h1>
              <p className="text-xs text-muted-foreground">Hantera din parkering</p>
            </div>
          </div>
          <ModeToggle />
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionCards.map((card) => (
            <button
              key={card.title}
              onClick={() => router.push(card.href as any)}
              className="bg-card rounded-2xl border border-border p-6 text-left hover: transition-all group hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${card.bgIcon} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <HugeiconsIcon icon={card.icon} className={`w-7 h-7 ${card.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-card-foreground mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground group-hover:text-blue-600 transition-colors">
                <span>Öppna</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Parking Information Card */}
        <div className="bg-card rounded-2xl  overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <HugeiconsIcon icon={CarParking01FreeIcons} className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-card-foreground">P-information</h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {/* Parking Name */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <HugeiconsIcon icon={Home02FreeIcons} className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Parkering</p>
                <p className="text-card-foreground font-medium">
                  {parking?.name?.toUpperCase() || 'CREWSEC PARKING'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Parking for {user?.name?.toLowerCase() || 'crewsec admin'}
                </p>
              </div>
            </div>

            {/* Website */}
            {parking?.website && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Globe02FreeIcons} className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Webbplats</p>
                  <a
                    href={parking.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    {parking.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}

            {/* Description */}
            {parking?.description && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Beskrivning</p>
                  <p className="text-foreground text-sm">{parking.description}</p>
                </div>
              </div>
            )}

            {/* Address */}
            {parking?.address && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Adress</p>
                  <p className="text-foreground text-sm">{parking.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// FileTextIcon component
function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
