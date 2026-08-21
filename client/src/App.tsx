import { BrowserRouter, Routes, Route } from 'react-router'
import { Propietarios } from './components/propietarios'
import { Inquilinos } from './components/inquilinos'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/propietarios' element={<Propietarios />}></Route>
          <Route path='/inquilinos' element={<Inquilinos />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App