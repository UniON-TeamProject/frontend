import ReactDom from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { Provider as ReduxProvider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { store } from './store/store.js'
import { theme } from './styles/theme.js'

ReactDom.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </ReduxProvider>
)
