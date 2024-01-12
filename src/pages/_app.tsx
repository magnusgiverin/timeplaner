import type { AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { AppContextProvider } from "../contexts/appContext";
import { LanguageProvider } from "~/contexts/languageContext";
import { CalendarContextProvider } from "~/contexts/calendarContext";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <LanguageProvider>
      <AppContextProvider>
        <CalendarContextProvider>
          <Component {...pageProps} />
        </CalendarContextProvider>
      </AppContextProvider>
    </LanguageProvider>
  );
};

export default api.withTRPC(MyApp);
