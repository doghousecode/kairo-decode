import './globals.css'

export const metadata = {
  title: 'Kairo',
  description: 'Your AI chief of staff.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ background: '#0d0d0d' }}>
      <head>
        <meta name="theme-color" content="#0d0d0d" />
        <link rel="manifest" href="/manifest.json" />
        <script dangerouslySetInnerHTML={{ __html:
          `document.documentElement.style.background='#0d0d0d';document.documentElement.style.overflow='hidden';`
        }} />
      </head>
      <body className="antialiased" style={{ background: '#0d0d0d' }}>

        <div id="kairo-splash" style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#0d0d0d', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
          pointerEvents: 'none',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kairo-wordmark-cropped.png"
            alt="Kairo"
            style={{ width: '68vw', maxWidth: '680px', height: 'auto' }}
          />
          <p style={{
            color: 'rgba(240,240,240,0.35)',
            fontSize: 'clamp(0.65rem, 2vw, 0.85rem)',
            letterSpacing: '0.18em',
            textTransform: 'lowercase',
            fontWeight: 400,
            margin: 0,
          }}>
            adaptive intelligence chief-of-staff
          </p>
        </div>

        <div id="kairo-root" style={{ opacity: 0 }}>
          {children}
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function() {});
            });
          }
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var splash = document.getElementById('kairo-splash');
            var root   = document.getElementById('kairo-root');
            var done   = false;

            function show() {
              if (done) return;
              done = true;
              if (root)   { root.style.transition = 'opacity 0.5s ease'; root.style.opacity = '1'; }
              if (splash) { splash.style.transition = 'opacity 0.8s ease'; splash.style.opacity = '0'; splash.style.pointerEvents = 'none'; }
              document.documentElement.style.overflow = '';
            }

            // React signals when mounted — hides splash immediately
            window.kairoReady = show;

            // Fallback: always hide after 4s regardless
            setTimeout(show, 4000);

            window.kairoShowSplash = function() {
              if (!splash) return;
              splash.style.transition    = 'opacity 0.4s ease';
              splash.style.opacity       = '1';
              splash.style.pointerEvents = 'auto';
              splash.style.cursor        = 'pointer';
              done = false;
              // Stay until user taps/clicks — no auto-dismiss
              splash.addEventListener('click', show, { once: true });
            };
          })();
        `}} />
      </body>
    </html>
  )
}
