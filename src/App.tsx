/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import ListingDetails from './pages/ListingDetails';
import Profile from './pages/Profile';
import MyAds from './pages/MyAds';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import Favorites from './pages/Favorites';
import Following from './pages/Following';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="listing/:id" element={<ListingDetails />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="create-listing" element={<CreateListing />} />
              <Route path="edit-listing/:id" element={<EditListing />} />
              <Route path="profile" element={<Profile />} />
              <Route path="my-ads" element={<MyAds />} />
              <Route path="settings" element={<Settings />} />
              <Route path="chat" element={<Chat />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="following" element={<Following />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
