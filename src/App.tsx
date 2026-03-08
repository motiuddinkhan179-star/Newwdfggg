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
import ListingDetails from './pages/ListingDetails';

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
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
