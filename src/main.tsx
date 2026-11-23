import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppErrorBoundary } from './components/common/AppErrorBoundary.tsx';
import { installGlobalErrorReporting } from './lib/error-reporting.ts';
import { installDeployRefresh } from './lib/deploy-refresh.ts';

installGlobalErrorReporting();
installDeployRefresh();

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);
