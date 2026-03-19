import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import InitStage from './components/stages/InitStage';
import DesignStage from './components/stages/DesignStage';
import BuildStage from './components/stages/BuildStage';
import DeployStage from './components/stages/DeployStage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/init" replace />} />
        <Route path="/init" element={<InitStage />} />
        <Route path="/design" element={<DesignStage />} />
        <Route path="/build" element={<BuildStage />} />
        <Route path="/deploy" element={<DeployStage />} />
      </Route>
    </Routes>
  );
}
