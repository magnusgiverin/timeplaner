import type { AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { AppContextProvider } from "../contexts/appContext";
import { LanguageProvider } from "~/contexts/languageContext";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <LanguageProvider>
      <AppContextProvider>
        <Component {...pageProps} />
      </AppContextProvider>
    </LanguageProvider>
  );
};

export default api.withTRPC(MyApp);
