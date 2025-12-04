import { Routes, Route, Link } from 'react-router-dom';
import { BrowserRouter } from "react-router-dom"
import Home from './pages/Home';
import TestPage from './pages/TestPage';
import { useDispatch, useSelector } from 'react-redux';
import { increment } from './store/testSlice';

function App() {
  const value = useSelector(state => state.test.value)
  const dispatch = useDispatch()

  return (
    <>
      <BrowserRouter>
        <nav>
          <Link to="/">Strona główna</Link>
          <Link to="/testPage">Folder główny</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/testPage" element={<TestPage />} />
        </Routes>
        <p>{value}</p>
        <button onClick={() => dispatch(increment())}>+</button>
      </BrowserRouter>
    </>
  )

}

export default App
