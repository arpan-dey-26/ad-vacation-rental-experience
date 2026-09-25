/* Harness stub for next/image. Renders the plain <img> that next/image
   ultimately produces, so measured geometry is the real geometry.

   It also mirrors next/image's LOADING semantics, which matters for more than
   tidiness: the first version dropped `priority` and never emitted `loading`,
   so every image in the harness was eager and a performance probe counted 43
   requests when the photo tour opened. That number was the stub's, not the
   application's. Modelling the default here is what makes a request count
   measured on the harness mean anything at all.

   next/image's rule: `loading="lazy"` unless `priority` is set, in which case
   the image is eager and gets `fetchpriority="high"`. */
import * as React from 'react';

interface StubProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export default function Image({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  className,
}: StubProps) {
  return React.createElement('img', {
    src,
    alt,
    width,
    height,
    sizes,
    className,
    loading: priority ? 'eager' : 'lazy',
    fetchPriority: priority ? 'high' : undefined,
  });
}
