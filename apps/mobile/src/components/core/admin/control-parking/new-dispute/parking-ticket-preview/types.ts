import { type Doc, type Id } from 'convex/_generated/dataModel';

export interface DetailRowProps {
  label: string;
  value: string | number | undefined | null;
}

export interface SectionProps {
  title: string;
  content: string | undefined | null;
}

export interface ParkingTicketPreviewProps {
  violation: Doc<'violations'> | null | undefined;
  town: Doc<'towns'> | null | undefined;
  locationViolation:
    | {
        price: number;
        locationId: Id<'locations'> | string;
        violationId: Id<'violations'> | string;
      }
    | null
    | undefined;
  formData: {
    id: string;
    reference: string;
    mark?: string | null;
    locationId: string;
    townId: string;
    violationId: string;
    galleryStorageIds: string[];
    isSignsChecked?: boolean;
    isPhotosTaken?: boolean;
    startDate?: number;
    endDate?: number;
    easyParkResponse?: any;
    device?: any;
  };
}
