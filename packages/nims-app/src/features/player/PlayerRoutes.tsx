import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';

const PlayerCabinet = lazy(() => import('./PlayerCabinetPage'));

function PageLoader() {
  return (
    <Center h="60vh">
      <Loader size="lg" />
    </Center>
  );
}

export function PlayerRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<PlayerCabinet />} />
        <Route path="/questionnaire" element={<PlayerCabinet />} />
        <Route path="/character" element={<PlayerCabinet />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
