import { AppProps } from 'next/app';
import NextNprogress from 'nextjs-progressbar';
import Header from '../components/Header';

import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <div>
      <NextNprogress
        color="var(--pink-500)"
        startPosition={0.3}
        options={{ showSpinner: false }}
        stopDelayMs={200}
        height={3}
        showOnShallow
      />
      <Header />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
