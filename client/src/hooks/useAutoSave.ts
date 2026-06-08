import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  saveNow: () => Promise<void>;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 3000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousDataRef = useRef<string>(JSON.stringify(data));
  const isFirstRender = useRef(true);
  const dataRef = useRef(data);
  dataRef.current = data;

  const saveNow = useCallback(async () => {
    if (!enabled) return;
    try {
      setIsSaving(true);
      await onSave(dataRef.current);
      setLastSaved(new Date());
      previousDataRef.current = JSON.stringify(dataRef.current);
      toast.success('Changes auto-saved', { duration: 2000 });
    } catch (error: any) {
      toast.error('Auto-save failed: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  }, [enabled, onSave]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousDataRef.current = JSON.stringify(data);
      return;
    }
    if (!enabled) return;

    const serialized = JSON.stringify(data);
    if (serialized === previousDataRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(saveNow, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, enabled, delay, saveNow]);

  return { isSaving, lastSaved, saveNow };
}
