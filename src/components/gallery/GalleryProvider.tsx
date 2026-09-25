'use client';

import { createContext, useContext } from 'react';
import { useGalleryView, type GalleryController } from '@/hooks/useGalleryView';
import { Lightbox } from './Lightbox';
import { PhotoTour } from './PhotoTour';
import type { Photo, PhotoCategory } from '@/lib/types';

const GalleryContext = createContext<GalleryController | null>(null);

interface GalleryProviderProps {
  photos: Photo[];
  categories: PhotoCategory[];
  listingTitle: string;
  children: React.ReactNode;
}

/**
 * Owns the shared gallery state and mounts the overlay views.
 *
 * `children` is passed through untouched, so the whole listing page stays
 * server-rendered even though this component is a client boundary — only the
 * few components that actually call `useGallery()` ship JavaScript.
 *
 * The tour stays mounted whenever anything is open. That is not a convenience:
 * every captured lightbox URL carried `modal=PHOTO_TOUR_SCROLLABLE` alongside
 * `modalItem`, and TOUR-8 measured the tour holding its own scroll position
 * underneath. Unmounting it would lose both facts — and would lose the user's
 * place in 43 photos every time they viewed one.
 *
 * Exactly one layer owns the keyboard: `tourActive` is false while the lightbox
 * is up, which is what stops both overlays trapping focus at once.
 */
export function GalleryProvider({
  photos,
  categories,
  listingTitle,
  children,
}: GalleryProviderProps) {
  const controller = useGalleryView(photos.length);
  const { view, close, openLightbox, stepPhoto, tourTrigger, lightboxTrigger } =
    controller;

  const tourVisible = view.kind !== 'closed';
  const lightboxOpen = view.kind === 'lightbox';

  return (
    <GalleryContext.Provider value={controller}>
      {children}

      <PhotoTour
        open={tourVisible}
        active={!lightboxOpen}
        onClose={close}
        onSelectPhoto={openLightbox}
        photos={photos}
        categories={categories}
        listingTitle={listingTitle}
        returnFocusTo={tourTrigger.current}
      />

      <Lightbox
        open={lightboxOpen}
        photoIndex={lightboxOpen ? view.photoIndex : 0}
        photos={photos}
        categories={categories}
        onClose={close}
        onStep={stepPhoto}
        returnFocusTo={lightboxTrigger.current}
      />
    </GalleryContext.Provider>
  );
}

export function useGallery(): GalleryController {
  const controller = useContext(GalleryContext);
  if (!controller) {
    throw new Error('useGallery must be used inside <GalleryProvider>');
  }
  return controller;
}
