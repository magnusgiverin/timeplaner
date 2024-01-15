import type { AppType } from "next/app";
import { api } from "~/utils/api";
import Head from 'next/head';

import "~/styles/globals.css";
import { AppContextProvider } from "../contexts/appContext";
import { LanguageProvider } from "~/contexts/languageContext";
import { CalendarContextProvider } from "~/contexts/calendarContext";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <SpeedInsights />
      <Analytics />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <LanguageProvider>
        <AppContextProvider>
          <CalendarContextProvider>
            <Component {...pageProps} />
          </CalendarContextProvider>
        </AppContextProvider>
      </LanguageProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
