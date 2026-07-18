import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';

const Overview = lazy(() => import('@/features/overview/OverviewPage'));
const Characters = lazy(() => import('@/features/characters/CharactersPage'));
const Stories = lazy(() => import('@/features/stories/StoriesPage'));
const Groups = lazy(() => import('@/features/groups/GroupsPage'));
const Relations = lazy(() => import('@/features/relations/RelationsPage'));
const Adaptations = lazy(() => import('@/features/adaptations/AdaptationsPage'));
const Briefings = lazy(() => import('@/features/briefings/BriefingsPage'));
const Timeline = lazy(() => import('@/features/timeline/TimelinePage'));
const Network = lazy(() => import('@/features/network/NetworkPage'));
const Search = lazy(() => import('@/features/search/SearchPage'));
const Admin = lazy(() => import('@/features/admin/AdminPage'));

function PageLoader() {
  return (
    <Center h="60vh">
      <Loader size="lg" />
    </Center>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/relations" element={<Relations />} />
        <Route path="/adaptations" element={<Adaptations />} />
        <Route path="/briefings" element={<Briefings />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/network" element={<Network />} />
        <Route path="/search" element={<Search />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Suspense>
  );
}
