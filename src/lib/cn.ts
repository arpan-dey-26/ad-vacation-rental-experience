/**
 * Join class names, dropping falsy values.
 *
 * Deliberately ~10 lines instead of a `clsx` + `tailwind-merge` dependency:
 * this project composes classes, it does not need conflict resolution.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
