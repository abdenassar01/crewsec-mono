/* eslint-disable max-lines-per-function */
import React, {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  type StyleProp,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

const formatElapsedTime = (totalSeconds: number): string => {
  const validTotalSeconds =
    typeof totalSeconds === 'number' &&
    !isNaN(totalSeconds) &&
    totalSeconds >= 0
      ? Math.floor(totalSeconds)
      : 0;

  const days = Math.floor(validTotalSeconds / 86400);
  const remainingSecondsAfterDays = validTotalSeconds % 86400;
  const hours = Math.floor(remainingSecondsAfterDays / 3600);
  const remainingSecondsAfterHours = remainingSecondsAfterDays % 3600;
  const minutes = Math.floor(remainingSecondsAfterHours / 60);
  const seconds = remainingSecondsAfterHours % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (days > 0) {
    return `${days}:${hh}:${mm}:${ss}`;
  } else {
    return `${hh}:${mm}:${ss}`;
  }
};

const parseTimestamp = (time: Date | number | undefined): number | null => {
  let ms: number;
  if (time instanceof Date) {
    ms = time.getTime();
  } else if (typeof time === 'number') {
    ms = time;
  } else {
    return null;
  }

  if (isNaN(ms)) {
    return null;
  }
  return ms;
};

export interface CountUpTimerProps {
  initialTime?: Date | number;
  intervalDelay?: number;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onTick?: (elapsedSeconds: number) => void;
  onStart?: (startTime: number) => void;
  onStop?: (stopTime: number, elapsedSeconds: number) => void;
  onReset?: () => void;
  autoStart?: boolean;
}

export interface CountUpTimerHandle {
  start: () => void;
  stop: () => void;
  reset: (newInitialTime?: Date | number) => void;
  getElapsedTime: () => number;
  getTimestamps: () => {
    initialStartTime: number | null;
    lastStopTime: number | null;
  };
  isRunning: () => boolean;
}

export const CountUpTimer = forwardRef<CountUpTimerHandle, CountUpTimerProps>(
  (
    {
      initialTime,
      intervalDelay = 1000,
      containerStyle,
      textStyle,
      onTick,
      onStart,
      onStop,
      onReset,
      autoStart = true,
    }: CountUpTimerProps,
    ref: ForwardedRef<CountUpTimerHandle>,
  ) => {
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [displaySeconds, setDisplaySeconds] = useState<number>(0);
    const [initialStartTime, setInitialStartTime] = useState<number | null>(
      null,
    );
    const [lastStopTime, setLastStopTime] = useState<number | null>(null);
    const [referenceTime, setReferenceTime] = useState<number | null>(null);
    const [accumulatedSeconds, setAccumulatedSeconds] = useState<number>(0);
    const [isValidInitialTime, setIsValidInitialTime] = useState<boolean>(true);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const initialMount = useRef(true);

    const clearTimerInterval = useCallback(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, []);

    const calculateElapsedTime = useCallback(() => {
      if (!isRunning || referenceTime === null) {
        return accumulatedSeconds;
      }
      const now = Date.now();
      const intervalElapsedMs = Math.max(0, now - referenceTime);
      return accumulatedSeconds + intervalElapsedMs / 1000;
    }, [isRunning, referenceTime, accumulatedSeconds]);

    const tick = useCallback(() => {
      const currentElapsed = calculateElapsedTime();
      setDisplaySeconds(currentElapsed);
      if (onTick) {
        onTick(currentElapsed);
      }
    }, [calculateElapsedTime, onTick]);

    const internalStart = useCallback(() => {
      if (isRunning || !isValidInitialTime) {
        return;
      }
      const now = Date.now();
      setIsRunning(true);
      setReferenceTime(now);
      setLastStopTime(null);
      const firstStart = initialStartTime === null;
      if (firstStart) {
        setInitialStartTime(now);
      }
      clearTimerInterval();
      setTimeout(() => tick(), 0);
      intervalRef.current = setInterval(tick, intervalDelay);
      if (onStart) {
        onStart(firstStart ? now : initialStartTime!);
      }
    }, [
      isRunning,
      isValidInitialTime,
      initialStartTime,
      clearTimerInterval,
      tick,
      intervalDelay,
      onStart,
    ]);

    const internalStop = useCallback(() => {
      if (!isRunning) return;
      clearTimerInterval();
      const now = Date.now();
      const currentElapsed = calculateElapsedTime();
      setIsRunning(false);
      setAccumulatedSeconds(currentElapsed);
      setDisplaySeconds(currentElapsed);
      setLastStopTime(now);
      setReferenceTime(null);
      if (onStop) {
        onStop(now, currentElapsed);
      }
    }, [isRunning, clearTimerInterval, calculateElapsedTime, onStop]);

    const internalReset = useCallback(
      (newInitialTimeValue?: Date | number) => {
        clearTimerInterval();
        setIsRunning(false);
        const timeForReset = newInitialTimeValue ?? initialTime;
        const parsedTime = parseTimestamp(timeForReset);
        const isValid = parsedTime !== null;
        const canRestart = isValid || timeForReset === undefined;
        setIsValidInitialTime(isValid || timeForReset === undefined);
        setAccumulatedSeconds(0);
        setDisplaySeconds(0);
        setInitialStartTime(null);
        setLastStopTime(null);
        setReferenceTime(null);
        if (onReset) {
          onReset();
        }
        if (autoStart && canRestart) {
          const now = Date.now();
          const effectiveStartTime = parsedTime ?? now;
          setInitialStartTime(effectiveStartTime);
          setReferenceTime(now);
          setIsRunning(true);
          intervalRef.current = setInterval(tick, intervalDelay);
          if (onStart) {
            onStart(effectiveStartTime);
          }
        }
      },
      [
        clearTimerInterval,
        initialTime,
        autoStart,
        tick,
        intervalDelay,
        onReset,
        onStart,
      ],
    );

    useEffect(() => {
      if (initialMount.current) {
        initialMount.current = false;
        const parsedTime = parseTimestamp(initialTime);
        const isValid = parsedTime !== null;
        const canStart = isValid || initialTime === undefined;
        setIsValidInitialTime(canStart);
        clearTimerInterval();
        if (autoStart && canStart) {
          const now = Date.now();
          const effectiveStartTime = parsedTime ?? now;
          setInitialStartTime(effectiveStartTime);
          setReferenceTime(now);
          setAccumulatedSeconds(0);
          setDisplaySeconds(0);
          setLastStopTime(null);
          setIsRunning(true);
          intervalRef.current = setInterval(tick, intervalDelay);
          if (onStart) {
            onStart(effectiveStartTime);
          }
        } else {
          setIsRunning(false);
          setAccumulatedSeconds(0);
          setDisplaySeconds(0);
          setInitialStartTime(parsedTime);
          setLastStopTime(null);
          setReferenceTime(null);
        }
      }
      return clearTimerInterval;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      start: internalStart,
      stop: internalStop,
      reset: internalReset,
      getElapsedTime: calculateElapsedTime,
      getTimestamps: () => ({ initialStartTime, lastStopTime }),
      isRunning: () => isRunning,
    }));

    const displayTime = formatElapsedTime(displaySeconds);

    if (!isValidInitialTime && !autoStart && initialTime !== undefined) {
      return (
        <View style={containerStyle}>
          <Text style={textStyle}>Invalid Initial Time</Text>
        </View>
      );
    }

    return (
      <View style={containerStyle}>
        <Text style={textStyle}>{displayTime}</Text>
      </View>
    );
  },
);

CountUpTimer.displayName = 'CountUpTimer';
