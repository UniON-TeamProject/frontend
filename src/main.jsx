import ReactDom from 'react-dom/client'

const APP_VERSION = __APP_VERSION__;
const storedVersion = localStorage.getItem("appVersion");
if (storedVersion !== APP_VERSION) {
  const token = localStorage.getItem("token");
  localStorage.clear();
  if (token) localStorage.setItem("token", token);
  localStorage.setItem("appVersion", APP_VERSION);
}
import './index.css'
import App from './App.jsx'

import { Provider as ReduxProvider, useSelector } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { store } from './store/store.js'
import { buildTheme } from './styles/theme.js'

function ThemedApp() {
  const color = useSelector((state) => state.theme.color);
  const theme = buildTheme(color);
  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
}

ReactDom.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <ThemedApp />
  </ReduxProvider>
)
