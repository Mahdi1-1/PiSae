/** Resolves API-relative paths to the gateway origin so links work from the Angular dev server. */
export function absoluteGatewayUrl(path: string | null | undefined): string {
  if (!path) {
    return '';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = 'http://localhost:8091';
  return base + (path.startsWith('/') ? path : `/${path}`);
}
