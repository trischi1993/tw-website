const EBOOK_HOST = 'ebook.tristanweithaler.com';

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: AssetsBinding;
}

const LOCAL_ASSET_PATHS = [
  '/_astro/',
  '/fonts/',
  '/lottie/',
];

const LOCAL_ASSET_FILES = new Set([
  '/favicon.png',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/og-default.png',
]);

function redirect(requestUrl: URL, pathname: string) {
  const target = new URL(requestUrl);
  target.pathname = pathname;
  return Response.redirect(target, 301);
}

function assetRequest(request: Request, pathname?: string) {
  if (!pathname) return request;
  const assetUrl = new URL(request.url);
  assetUrl.pathname = pathname;
  return new Request(assetUrl, request);
}

function isLocalAsset(pathname: string) {
  return (
    LOCAL_ASSET_FILES.has(pathname) ||
    LOCAL_ASSET_PATHS.some((prefix) => pathname.startsWith(prefix))
  );
}

async function systemeOrigin(request: Request, requestUrl: URL) {
  // Auf der echten Route reicht das unveränderte Request-Objekt den Aufruf an
  // den im DNS hinterlegten Systeme.io-/CloudFront-Ursprung durch. Auf der
  // workers.dev-Testadresse wird nur der Host auf die echte Subdomain gesetzt.
  if (requestUrl.hostname === EBOOK_HOST) return fetch(request);

  const upstreamUrl = new URL(requestUrl);
  upstreamUrl.protocol = 'https:';
  upstreamUrl.host = EBOOK_HOST;
  return fetch(new Request(upstreamUrl, request));
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Öffentliche E-Book-URLs. Die Astro-Seiten bleiben intern an ihren
    // bestehenden Build-Pfaden; der Browser sieht nur die kurzen URLs.
    if (pathname === '/') {
      return env.ASSETS.fetch(assetRequest(request, '/e-book/'));
    }
    if (pathname === '/bestellen' || pathname === '/bestellen/') {
      return env.ASSETS.fetch(assetRequest(request, '/e-book/bestellformular/'));
    }

    // Versehentlich aufgerufene interne Build-Pfade nicht als zweite,
    // indexierbare Version ausliefern.
    if (pathname === '/e-book' || pathname === '/e-book/') return redirect(url, '/');
    if (
      pathname === '/e-book/bestellformular' ||
      pathname === '/e-book/bestellformular/'
    ) {
      return redirect(url, '/bestellen/');
    }

    // Nur die Assets der beiden neuen Seiten kommen aus dem Astro-Build.
    if (isLocalAsset(pathname)) return env.ASSETS.fetch(request);

    // Alles andere – insbesondere /bestellformular, /dankeseite, /agb,
    // /datenschutzerklaerung und /impressum – bleibt unverändert bei Systeme.io.
    return systemeOrigin(request, url);
  },
};
