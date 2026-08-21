import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Navbar } from './components/Navbar';
import { Propietarios } from './components/propietarios';
import { Inquilinos } from './components/inquilinos';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/propietarios" replace />} />
            <Route path="/propietarios" element={<Propietarios />} />
            <Route path="/inquilinos" element={<Inquilinos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;