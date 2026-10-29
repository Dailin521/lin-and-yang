/** Stored demo references stay portable between localhost and the Pages subdirectory. */
export function publicAsset(ref: string | undefined, base: string): string {
  if (ref?.startsWith('/assets/')) return base.replace(/\/?$/, '/') + ref.slice(1);
  return ref || '';
}
