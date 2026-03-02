import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript,
} from "next/document";

/**
 * Document to render for styled components
 */
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
          <title>Hymns</title>

          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://songapp.vercel.app" />
          <meta property="og:image" content="/logo.png" />
          <meta property="og:image:alt" content="Song App Logo" />
          <link
            rel="preload"
            href="/fonts/HKGrotesk-Light.otf"
            type="font/otf"
            as="font"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/HKGrotesk-Regular.otf"
            type="font/otf"
            as="font"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/HKGrotesk-Medium.otf"
            type="font/otf"
            as="font"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/HKGrotesk-SemiBold.otf"
            type="font/otf"
            as="font"
            crossOrigin="anonymous"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl+ '&gtm_auth=CqxMS5tRYjOhnxNpAiP2TQ&gtm_preview=env-1&gtm_cookies_win=x';f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MKDS55S');`,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `(function () {
                window.onpageshow = function(event) {
                  if (event.persisted) {
                    window.location.reload();
                  }
                };
              })();`,
            }}
          />
        </Head>
        <body>
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-MKDS55S&gtm_auth=CqxMS5tRYjOhnxNpAiP2TQ&gtm_preview=env-1&gtm_cookies_win=x"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
