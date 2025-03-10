import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { useEffect, useState } from "react"; // Import useState and useEffect

type Pages = Record<string, { default: React.ComponentType }>;

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

declare global {
  interface ImportMeta {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
}

export default function App() {
  const [pages, setPages] = useState<Pages>({});
  const { t } = useTranslation();

  useEffect(() => {
    // Load pages asynchronously
    const loadPages = async () => {
      const loadedPages = await Promise.all(
        Object.entries(import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)")).map(
          async ([key, value]) => {
            const module = await value();
            const mod = module as { default: React.ComponentType };
            return [key, { default: mod.default }];
          }
        )
      ).then(entries => Object.fromEntries(entries));
      setPages(loadedPages);
    };

    loadPages();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[
                {
                  label: t("NavigationMenu.pageName"),
                  destination: "/pagename",
                },
              ]}
            />
            <Routes pages={pages} />
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}