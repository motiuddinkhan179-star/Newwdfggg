import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, Edit2, Check, X, Heart, User } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
      toast.error('Failed to log out');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !newName.trim()) return;
    setUpdatingProfile(true);
    try {
      await updateProfile(user, { displayName: newName });
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { displayName: newName });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 md:pb-12 bg-gray-50 min-h-screen"
    >
      {/* Profile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 pb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
          <div className="flex flex-col md:flex-row items-center md:items-end md:space-x-6">
            <div className="relative">
              {user.photoURL ? (
                <img className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white shadow-md object-cover" src={user.photoURL} alt="" />
              ) : (
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-white shadow-md">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 md:mb-4 text-center md:text-left flex-1">
              {isEditing ? (
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button onClick={handleUpdateProfile} disabled={updatingProfile} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => setIsEditing(false)} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start group">
                  <h1 className="text-2xl font-bold text-gray-900">{user.displayName || 'User'}</h1>
                  <button onClick={() => setIsEditing(true)} className="ml-2 p-1 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <div className="mt-6 md:mt-0 md:mb-4 flex space-x-3">
              <Link to="/settings" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Options</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <Link to="/my-ads" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors group border border-gray-100 hover:border-indigo-100">
                <div className="bg-white p-3 rounded-lg shadow-sm group-hover:text-indigo-600 text-gray-500 transition-colors">
                  <Edit2 className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">My Ads</h3>
                  <p className="text-sm text-gray-500">View and manage your listings</p>
                </div>
              </Link>

              <Link to="/favorites" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors group border border-gray-100 hover:border-red-100">
                <div className="bg-white p-3 rounded-lg shadow-sm group-hover:text-red-600 text-gray-500 transition-colors">
                  <Heart className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-red-700 transition-colors">Favorites</h3>
                  <p className="text-sm text-gray-500">View your liked listings</p>
                </div>
              </Link>

              <Link to="/following" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors group border border-gray-100 hover:border-green-100">
                <div className="bg-white p-3 rounded-lg shadow-sm group-hover:text-green-600 text-gray-500 transition-colors">
                  <User className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-700 transition-colors">Following</h3>
                  <p className="text-sm text-gray-500">Sellers you follow</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
