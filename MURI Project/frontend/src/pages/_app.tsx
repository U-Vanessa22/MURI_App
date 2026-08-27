import type { AppProps } from 'next/app';
// Next.js only allows global CSS to be imported here, in _app.
// All of these were plain (non-Module) global stylesheets under CRA too -
// this just moves the import statements, no className/JSX logic changed.
import '../tailwind.css';
import '../styles/global.css';
import '../components/layout/unifiedSidebar.css';
import '../components/layout/topNavbar.css';
import '../components/common/InteractiveHoverButton.css';
import '../screens/chatbot.css';
import '../screens/dataAssets.css';
import '../screens/assetIssuance.css';
import '../screens/disposal.css';
import '../screens/document.css';
import '../screens/report.css';
import '../screens/Login/Login.css';
import '../screens/Dashboards/User Dashboard/userdashboard.css';
import '../screens/voucherpage.css';
import '../screens/Dashboards/IT Dashboard/itdashboard.css';
import '../screens/Dashboards/dashboardConsistency.css';
import '../screens/settings.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
