import { useCallback, useEffect, useState } from 'react';

// TypeScript types for the API response
export interface Parking {
  areaName: string;
  areaNo: string;
  endDateLocal: string;
  [key: string]: any; // Allow for other fields
}

export interface EasyParkResponse {
  message: string;
  data: {
    parkings: Parking[];
  };
}

export interface UseCheckParkingReturn {
  data: EasyParkResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCheckParking = (
  licenseNumber: string,
): UseCheckParkingReturn => {
  const [data, setData] = useState<EasyParkResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!licenseNumber?.trim()) {
      setError(new Error('License number is required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_CONVEX_SITE_URL}/easypark-check?licenseNumber=${encodeURIComponent(licenseNumber)}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: EasyParkResponse = await response.json();
      setData(result);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch parking data');
      setError(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [licenseNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
