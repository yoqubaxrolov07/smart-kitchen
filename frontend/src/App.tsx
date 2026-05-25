import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Upload from './pages/Upload';
import CompareModels from './pages/CompareModels';
import Pipeline from './pages/Pipeline';
import Recipes from './pages/Recipes';
import Assistant from './pages/Assistant';
import Landing from './pages/Landing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/business" element={<Layout mode="business" />}>
          <Route index element={<Dashboard />} />
          <Route path="predict" element={<Predict />} />
          <Route path="upload" element={<Upload />} />
          <Route path="compare" element={<CompareModels />} />
          <Route path="pipeline" element={<Pipeline />} />
        </Route>
        <Route path="/personal" element={<Layout mode="personal" />}>
          <Route index element={<Recipes />} />
          <Route path="assistant" element={<Assistant />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
