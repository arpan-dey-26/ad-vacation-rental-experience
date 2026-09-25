type Status = 'idle' | 'loading' | 'loaded' | 'failed';
type Consumer = { priority: number; notify: () => void; needed: () => boolean };
type Entry = {
  status: Status;
  attempts: number;
  readyAt: number;
  consumers: Set<Consumer>;
  image?: HTMLImageElement;
};

const entries = new Map<string, Entry>();
const retryDelays = [2000, 5000];
let active = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let cooldownUntil = 0;

function entryFor(src: string): Entry {
  let entry = entries.get(src);
  if (!entry) {
    entry = { status: 'idle', attempts: 0, readyAt: 0, consumers: new Set() };
    entries.set(src, entry);
  }
  return entry;
}

function schedule() {
  if (active) return;
  clearTimeout(timer);
  timer = setTimeout(pump, Math.max(0, cooldownUntil - Date.now()));
}

function pump() {
  if (active) return;
  const now = Date.now();
  let next: [string, Entry] | undefined;
  let bestPriority = -1;
  let earliest = Infinity;
  for (const [src, entry] of entries) {
    if (entry.status !== 'idle') continue;
    const priorities = [...entry.consumers]
      .filter((c) => c.needed())
      .map((c) => c.priority);
    if (!priorities.length) continue;
    if (entry.readyAt > now) {
      earliest = Math.min(earliest, entry.readyAt);
      continue;
    }
    const priority = Math.max(...priorities);
    if (priority > bestPriority) {
      next = [src, entry];
      bestPriority = priority;
    }
  }
  if (!next) {
    if (earliest !== Infinity) timer = setTimeout(pump, earliest - now);
    return;
  }

  const [src, entry] = next;
  active = true;
  entry.status = 'loading';
  entry.attempts += 1;
  // Retain the decoded image for reuse by every view in this document.
  const image = new Image();
  entry.image = image;
  const finish = (success: boolean) => {
    image.onload = null;
    image.onerror = null;
    active = false;
    if (success) {
      entry.status = 'loaded';
    } else {
      entry.status = entry.attempts < 3 ? 'idle' : 'failed';
      const delay = retryDelays[entry.attempts - 1] ?? 5000;
      entry.readyAt = Date.now() + delay;
      // Cool down the entire origin, not just this URL, after an error.
      cooldownUntil = entry.readyAt;
    }
    entry.consumers.forEach((consumer) => consumer.notify());
    schedule();
  };
  image.onload = () => finish(image.naturalWidth > 0 && image.naturalHeight > 0);
  image.onerror = () => finish(false);
  image.src = src;
}

export function imageLoaded(src: string) {
  return entries.get(src)?.status === 'loaded';
}

export function subscribeImage(src: string, consumer: Consumer) {
  const entry = entryFor(src);
  entry.consumers.add(consumer);
  schedule();
  return () => {
    entry.consumers.delete(consumer);
    schedule();
  };
}
