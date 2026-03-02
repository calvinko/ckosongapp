// @ts-nocheck
import type { AppProps } from "next/app";
import Head from "next/head";
import React from "react";
import "../css/placeholder.min.css";
import "../css/global.css";
import "../css/audio-player.scss";
import { Provider as ReduxProvider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { SessionProvider, useSession } from "next-auth/react";
import { SpeedInsights } from "@vercel/speed-insights/next"

import { useStore } from "../lib/redux/store";
import Loading from "../components/Loading";
import SongTypeProvider from "../components/SongTypeProvider";
import AudioPlayerProvider from "../lib/audio-player/AudioPlayerContext"

import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Global App
 *
 * @param param0
 */
function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const store = useStore(pageProps.initialReduxState);
  const persistor = persistStore(store, {}, function () {
    persistor.persist();
  });

  return (
    <SessionProvider
      session={session}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <ReduxProvider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <SongTypeProvider>
            <Head>
              <link rel="preload" href="/x.svg" as="image" />
              <link rel="preload" href="/sliders.svg" as="image" />
              <link rel="preload" href="/sliders-success.svg" as="image" />
              <link rel="preload" href="/tcog-logo.jpg" as="image" />
              <link rel="preload" href="/share.svg" as="image" />
              <link rel="preload" href="/copy.svg" as="image" />
              <link rel="preload" href="/star.svg" as="image" />
              <link rel="preload" href="/star-filled.svg" as="image" />
              <link rel="preload" href="/copy.svg" as="image" />

              <meta
                name="viewport"
                content="width=device-width, initial-scale=1, maximum-scale=1"
              />
              <meta property="og:title" content="Hymns" key="title" />
              <meta property="og:type" content="website" />
              <meta
                property="og:description"
                content="Church of God Hymnals"
                key="description"
              />
              <meta
                property="og:image"
                content="https://songs.timothyko.org/tcog-logo.jpg"
                key="image"
              />
            </Head>
            <Component {...pageProps} />
            <SpeedInsights />
          </SongTypeProvider>
        </PersistGate>
      </ReduxProvider>
      <style global jsx>{`
          * {
            box-sizing: border-box;
            font-family: "HKGrotesk";
          }
          body {
            font-family: "HKGrotesk";
            font-weight: 400;
            font-size: 16px;
            letter-spacing: 0.3px;
            color: #0A162A;
          }
          .h1 {
            font-family: "Chivo";
            font-size: 60px;
            font-weight: 500;
            letter-spacing: 0.3px;
          }
          
          .h2 {
            font-family: "Chivo";
            font-weight: 400;
            font-size: 45px;
            letter-spacing: 0.5px;
          }
          
          .h3 {
            font-family: "Chivo";
            font-weight: 400;
            font-size: 32px;
            letter-spacing: 0px;
          }
          
          .h4 {
            font-family: "Chivo";
            font-weight: 400;
            font-size: 25px;
            letter-spacing: -0.15px;
          }
          
          .p {
            font-family: "HKGrotesk";
            font-weight: 400;
            font-size: 16px;
            letter-spacing: 0.3px;
          }
          .arrow-icon {
            vertical-align: middle;
            height: 16px;
            width: 16px;
            padding-bottom: 2px;
          }
          em {
            font-style: normal;
            font-weight: 700;
            margin: 0;
          }
          @font-face {
            font-family: "HKGrotesk";
            src: url("/fonts/HKGrotesk-Light.otf") format("opentype");
            font-style: light;
            font-weight: 300;
            font-display: swap;
          }
          @font-face {
            font-family: "HKGrotesk";
            src: url("/fonts/HKGrotesk-Regular.otf") format("opentype");
            font-style: normal;
            font-weight: 400;
            font-display: swap;
          }
          @font-face {
            font-family: "HKGrotesk";
            src: url("/fonts/HKGrotesk-SemiBold.otf") format("opentype");
            font-style: normal;
            font-weight: 600;
            font-display: swap;
          }
          @font-face {
            font-family: "HKGrotesk";
            src: url("/fonts/HKGrotesk-Medium.otf") format("opentype");
            font-style: normal;
            font-weight: 500;
            font-display: swap;
          }
        `}</style>
    </SessionProvider>
  );
}

export default MyApp;
