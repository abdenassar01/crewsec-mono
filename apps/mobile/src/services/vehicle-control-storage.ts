/* eslint-disable max-params */
import { type Id } from 'convex/_generated/dataModel';
import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

// Storage instances for different data types
export const vehicleControlStorage = createMMKV({
  id: 'vehicle-control-storage',
  ...(Platform.OS !== 'web' && {
    encryptionKey: 'vehicle-control-encryption-key',
  }),
});

export const offlineDataStorage = createMMKV({
  id: 'offline-data-storage',
  ...(Platform.OS !== 'web' && {
    encryptionKey: 'offline-data-encryption-key',
  }),
});

// Storage keys
const STORAGE_KEYS = {
  SESSION: 'vehicle-control-session',
  LOCATIONS_CACHE: 'locations-cache',
  TOWNS_CACHE: 'towns-cache',
  VIOLATIONS_CACHE: 'violations-cache',
  LAST_SYNC: 'last-sync-timestamp',
  PENDING_UPLOADS: 'pending-uploads',
} as const;

// Session data structure
export interface VehicleControlSession {
  startTime: number | null;
  currentLocationId: Id<'locations'> | null;
  currentTownId: Id<'towns'> | null;
  selectedReferences: ReferenceEntry[];
  lastActiveTime: number;
  userId: string;
}

// Reference entry structure
export interface ReferenceEntry {
  id: string;
  reference: string;
  locationId: Id<'locations'>;
  townId: Id<'towns'>;
  violationId?: Id<'locationViolations'>;
  mark?: string;
  galleryStorageIds?: string[];
  isSignsChecked?: boolean;
  isPhotosTaken?: boolean;
  startDate?: number;
  endDate?: number;
  easyParkResponse?: string;
  device?: any;
  createdAt: number;
  completedAt?: number;
  userId: string;
}

// Town reference item structure
export interface TownReferenceItem {
  reference: string;
  createdAt: number;
  userId: string;
}

// Town references structure
export interface TownReferences {
  townId: Id<'towns'>;
  locationId: Id<'locations'>;
  references: TownReferenceItem[];
  lastUpdated: number;
  userId: string;
}

// Session management
export const sessionStorage = {
  // Save session data
  saveSession: (session: VehicleControlSession): void => {
    const key = `${STORAGE_KEYS.SESSION}-${session.userId}`;
    vehicleControlStorage.set(key, JSON.stringify(session));
  },

  // Load session data
  loadSession: (userId: string): VehicleControlSession | null => {
    try {
      const key = `${STORAGE_KEYS.SESSION}-${userId}`;
      const sessionData = vehicleControlStorage.getString(key);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  },

  // Clear session data
  clearSession: (userId: string): void => {
    const key = `${STORAGE_KEYS.SESSION}-${userId}`;
    vehicleControlStorage.remove(key);
  },

  // Update session partially
  updateSession: (
    updates: Partial<VehicleControlSession>,
    userId: string,
  ): void => {
    const currentSession = sessionStorage.loadSession(userId);
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        ...updates,
        lastActiveTime: Date.now(),
      };
      sessionStorage.saveSession(updatedSession);
    }
  },
};

export const referencesStorage = {
  saveTownReferences: (
    townId: Id<'towns'>,
    locationId: Id<'locations'>,
    references: TownReferenceItem[],
    userId: string,
  ): void => {
    const townRefs: TownReferences = {
      townId,
      locationId,
      references,
      lastUpdated: Date.now(),
      userId,
    };

    const key = `town-refs-${userId}-${townId}`;
    vehicleControlStorage.set(key, JSON.stringify(townRefs));
  },

  getTownReferences: (
    townId: Id<'towns'>,
    userId: string,
  ): TownReferences | null => {
    try {
      const key = `town-refs-${userId}-${townId}`;
      const data = vehicleControlStorage.getString(key);
      if (!data) return null;

      const parsed = JSON.parse(data);

      if (
        parsed.references &&
        parsed.references.length > 0 &&
        typeof parsed.references[0] === 'string'
      ) {
        parsed.references = (parsed.references as unknown as string[]).map(
          (ref) => ({
            reference: ref,
            createdAt: Date.now(),
            userId,
          }),
        );
      }

      return parsed;
    } catch (error) {
      console.error('Error getting town references:', error);
      return null;
    }
  },

  getAllTownsWithReferences: (userId: string): TownReferences[] => {
    const allKeys = vehicleControlStorage.getAllKeys();
    const townRefKeys = allKeys.filter((key) =>
      key.startsWith(`town-refs-${userId}-`),
    );

    const townRefs: TownReferences[] = [];
    townRefKeys.forEach((key) => {
      try {
        const data = vehicleControlStorage.getString(key);
        if (data) {
          const parsed = JSON.parse(data);

          if (
            parsed.references &&
            parsed.references.length > 0 &&
            typeof parsed.references[0] === 'string'
          ) {
            parsed.references = (parsed.references as unknown as string[]).map(
              (ref) => ({
                reference: ref,
                createdAt: Date.now(),
                userId,
              }),
            );
          }

          townRefs.push(parsed);
        }
      } catch (error) {
        console.error('Error parsing town references:', error);
      }
    });

    return townRefs.sort((a, b) => b.lastUpdated - a.lastUpdated);
  },

  deleteTownReferences: (townId: string, userId: string): void => {
    const key = `town-refs-${userId}-${townId}`;
    vehicleControlStorage.remove(key);
  },
};

export const referenceDetailsStorage = {
  saveReferenceDetails: (reference: ReferenceEntry): void => {
    const key = `ref-details-${reference.userId}-${reference.id}`;
    vehicleControlStorage.set(key, JSON.stringify(reference));
  },

  getReferenceDetails: (
    referenceId: string,
    userId: string,
  ): ReferenceEntry | null => {
    try {
      const key = `ref-details-${userId}-${referenceId}`;
      const data = vehicleControlStorage.getString(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting reference details:', error);
      return null;
    }
  },

  getTownReferenceDetails: (
    townId: string,
    userId: string,
  ): ReferenceEntry[] => {
    const allKeys = vehicleControlStorage.getAllKeys();
    const refDetailKeys = allKeys.filter((key) =>
      key.startsWith(`ref-details-${userId}-`),
    );

    const references: ReferenceEntry[] = [];
    refDetailKeys.forEach((key) => {
      try {
        const data = vehicleControlStorage.getString(key);
        if (data) {
          const ref: ReferenceEntry = JSON.parse(data);
          if (ref.townId === townId) {
            references.push(ref);
          }
        }
      } catch (error) {
        console.error('Error parsing reference details:', error);
      }
    });

    return references.sort((a, b) => a.createdAt - b.createdAt);
  },

  deleteReferenceDetails: (referenceId: string, userId: string): void => {
    const key = `ref-details-${userId}-${referenceId}`;
    vehicleControlStorage.remove(key);
  },
};

export const offlineDataCache = {
  // Cache locations
  cacheLocations: (locations: any[]): void => {
    offlineDataStorage.set(
      STORAGE_KEYS.LOCATIONS_CACHE,
      JSON.stringify({
        data: locations,
        timestamp: Date.now(),
      }),
    );
  },

  getCachedLocations: (): any[] | null => {
    try {
      const cached = offlineDataStorage.getString(STORAGE_KEYS.LOCATIONS_CACHE);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached locations:', error);
      return null;
    }
  },

  cacheTowns: (locationId: string, towns: any[]): void => {
    const key = `towns-cache-${locationId}`;
    offlineDataStorage.set(
      key,
      JSON.stringify({
        data: towns,
        timestamp: Date.now(),
      }),
    );
  },

  getCachedTowns: (locationId: string): any[] | null => {
    try {
      const key = `towns-cache-${locationId}`;
      const cached = offlineDataStorage.getString(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache for 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached towns:', error);
      return null;
    }
  },

  cacheViolations: (townId: string, violations: any[]): void => {
    const key = `violations-cache-${townId}`;
    offlineDataStorage.set(
      key,
      JSON.stringify({
        data: violations,
        timestamp: Date.now(),
      }),
    );
  },

  getCachedViolations: (townId: string): any[] | null => {
    try {
      const key = `violations-cache-${townId}`;
      const cached = offlineDataStorage.getString(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache for 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached violations:', error);
      return null;
    }
  },
};

export const syncStorage = {
  markForUpload: (referenceId: string): void => {
    const pending = syncStorage.getPendingUploads();
    if (!pending.includes(referenceId)) {
      pending.push(referenceId);
      vehicleControlStorage.set(
        STORAGE_KEYS.PENDING_UPLOADS,
        JSON.stringify(pending),
      );
    }
  },

  getPendingUploads: (): string[] => {
    try {
      const pending = vehicleControlStorage.getString(
        STORAGE_KEYS.PENDING_UPLOADS,
      );
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.error('Error getting pending uploads:', error);
      return [];
    }
  },

  removeFromPending: (referenceId: string): void => {
    const pending = syncStorage.getPendingUploads();
    const updated = pending.filter((id) => id !== referenceId);
    vehicleControlStorage.set(
      STORAGE_KEYS.PENDING_UPLOADS,
      JSON.stringify(updated),
    );
  },

  setLastSync: (): void => {
    vehicleControlStorage.set(STORAGE_KEYS.LAST_SYNC, Date.now());
  },

  getLastSync: (): number | null => {
    return vehicleControlStorage.getNumber(STORAGE_KEYS.LAST_SYNC) || null;
  },
};

export const storageUtils = {
  clearAllData: (userId: string): void => {
    const allKeys = vehicleControlStorage.getAllKeys();
    allKeys.forEach((key) => {
      if (
        key.startsWith(`town-refs-${userId}-`) ||
        key.startsWith(`ref-details-${userId}-`) ||
        key === `${STORAGE_KEYS.SESSION}-${userId}` ||
        key === STORAGE_KEYS.PENDING_UPLOADS
      ) {
        vehicleControlStorage.remove(key);
      }
    });
  },

  getStorageStats: (userId: string) => {
    const allKeys = vehicleControlStorage.getAllKeys();
    const session = sessionStorage.loadSession(userId);
    const townsWithRefs = referencesStorage.getAllTownsWithReferences(userId);
    const pendingUploads = syncStorage.getPendingUploads();

    return {
      totalKeys: allKeys.length,
      activeSession: session !== null,
      townsWithReferences: townsWithRefs.length,
      totalReferences: townsWithRefs.reduce(
        (sum, town) => sum + town.references.length,
        0,
      ),
      pendingUploads: pendingUploads.length,
      sessionStartTime: session?.startTime || null,
      lastActiveTime: session?.lastActiveTime || null,
    };
  },
};
