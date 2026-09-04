import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Navbar } from './components/Navbar';
import { Propietarios } from './components/propietarios';
import { Inquilinos } from './components/inquilinos';
import { TiposInmueble } from './components/tipos_inmueble';
import { Inmuebles } from './components/inmuebles';
import { Reservas } from './components/reservas';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/inmuebles" replace />} />
            <Route path="/inmuebles" element={<Inmuebles />} />
            <Route path="/tipos-inmueble" element={<TiposInmueble />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/propietarios" element={<Propietarios />} />
            <Route path="/inquilinos" element={<Inquilinos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;