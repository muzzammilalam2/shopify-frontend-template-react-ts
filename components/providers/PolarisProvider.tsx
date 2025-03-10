import { useCallback, ReactNode } from "react";
import { AppProvider } from "@shopify/polaris";
import { useNavigate } from "@shopify/app-bridge-react";
import "@shopify/polaris/build/esm/styles.css";
import { getPolarisTranslations } from "../../utils/i18nUtils";

interface AppBridgeLinkProps {
  readonly url: string;
  readonly children?: React.ReactNode;
  readonly external?: boolean;
  readonly [key: string]: any;
}

function AppBridgeLink({ url, children, external, ...rest }: Readonly<AppBridgeLinkProps>) {
  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    navigate(url);
  }, [url]);

  const IS_EXTERNAL_LINK_REGEX = /^(?:[a-z][a-z\d+.-]*:|\/\/)/;

  if (external || IS_EXTERNAL_LINK_REGEX.test(url)) {
    return (
      <a {...rest} href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button {...rest} onClick={handleClick} onKeyUp={(e) => { if (e.key === 'Enter') handleClick(); }}>
      {children}
    </button>
  );
}

/**
 * Sets up the AppProvider from Polaris.
 * @desc PolarisProvider passes a custom link component to Polaris.
 * The Link component handles navigation within an embedded app.
 * Prefer using this vs any other method such as an anchor.
 * Use it by importing Link from Polaris, e.g:
 *
 * ```
 * import {Link} from '@shopify/polaris'
 *
 * function MyComponent() {
 *  return (
 *    <div><Link url="/tab2">Tab 2</Link></div>
 *  )
 * }
 * ```
 *
 * PolarisProvider also passes translations to Polaris.
 *
 */

interface PolarisProviderProps {
  children: ReactNode;
}

export function PolarisProvider({ children }: Readonly<PolarisProviderProps>) {
  const translations = getPolarisTranslations() || {};

  return (
    <AppProvider i18n={translations} linkComponent={AppBridgeLink}>
      {children}
    </AppProvider>
  );
}
