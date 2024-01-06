import type { AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { AppContextProvider } from "../contexts/appContext";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <AppContextProvider>
      <Component {...pageProps} />
    </AppContextProvider>
  );
};

export default api.withTRPC(MyApp);
