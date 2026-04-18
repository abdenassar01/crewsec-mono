/* eslint-disable max-lines-per-function */
import { useCallback, useEffect, useState } from 'react';

import { storage } from '@/lib/storage';

const TIMER_START_DATE_KEY = 'vehicle_control_timer_start_date';
const TIMER_IS_ACTIVE_KEY = 'vehicle_control_timer_is_active';

export function useVehicleControlTimer() {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startTimer = useCallback(() => {
    const now = new Date();
    storage.set(TIMER_START_DATE_KEY, now.toISOString());
    storage.set(TIMER_IS_ACTIVE_KEY, true);
    setTimeElapsed(0);
    setIsActive(true);
  }, []);

  const resetTimer = useCallback(() => {
    storage.delete(TIMER_START_DATE_KEY);
    storage.set(TIMER_IS_ACTIVE_KEY, false);
    setTimeElapsed(0);
    setIsActive(false);
  }, []);

  // Initialize timer from storage and auto-start if not already started
  useEffect(() => {
    const storedStartDate = storage.getString(TIMER_START_DATE_KEY);
    const storedIsActive = storage.getBoolean(TIMER_IS_ACTIVE_KEY);

    if (storedStartDate && storedIsActive) {
      // Timer was already started, restore it
      const startDate = new Date(storedStartDate);
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startDate.getTime()) / 1000);
      setTimeElapsed(elapsed);
      setIsActive(true);
    } else {
      // Timer hasn't been started yet, start it automatically
      startTimer();
    }
  }, [startTimer]);

  // Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        const storedStartDate = storage.getString(TIMER_START_DATE_KEY);
        if (storedStartDate) {
          const startDate = new Date(storedStartDate);
          const now = new Date();
          const elapsed = Math.floor(
            (now.getTime() - startDate.getTime()) / 1000,
          );
          setTimeElapsed(elapsed);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
    };
  }, []);

  return {
    timeElapsed,
    isActive,
    formattedTime: formatTime(timeElapsed),
    startTimer,
    resetTimer,
  };
}
