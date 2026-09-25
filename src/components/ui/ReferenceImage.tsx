'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { imageLoaded, subscribeImage } from '@/lib/referenceImageQueue';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  src: string;
  priority?: boolean;
};

/** Gate source assignment so SSR, preloads and lazy images cannot bypass the queue. */
export default function ReferenceImage({ src, priority = false, alt, ...props }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);
  const [nearby, setNearby] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const visibleObserver = new IntersectionObserver(([entry]) =>
      setVisible(!!entry?.isIntersecting),
    );
    const nearbyObserver = new IntersectionObserver(
      ([entry]) => setNearby(!!entry?.isIntersecting),
      {
        rootMargin: '300px',
      },
    );
    visibleObserver.observe(node);
    nearbyObserver.observe(node);
    return () => {
      visibleObserver.disconnect();
      nearbyObserver.disconnect();
    };
  }, []);

  const rank = priority ? 3 : visible ? 2 : 1;
  const eligible = priority || nearby || visible;
  const subscribe = useCallback(
    (notify: () => void) =>
      eligible
        ? subscribeImage(src, {
            priority: rank,
            notify,
            needed: () =>
              !!ref.current && !ref.current.closest('[inert], [aria-hidden="true"]'),
          })
        : () => {},
    [src, eligible, rank],
  );
  const loaded = useSyncExternalStore(
    subscribe,
    () => imageLoaded(src),
    () => false,
  );

  return (
    // eslint-disable-next-line @next/next/no-img-element -- unoptimized source is owned by the shared queue
    <img {...props} ref={ref} alt={alt} src={loaded ? src : undefined} decoding="async" />
  );
}
