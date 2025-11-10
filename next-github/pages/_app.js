import { SessionProvider } from 'next-auth/react'; 
import '../pages/index.module.css'; 

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
