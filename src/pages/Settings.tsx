import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Lock, Shield, User, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Account Info State
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [updatingAccount, setUpdatingAccount] = useState(false);

  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Notifications & Privacy State (Mock)
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showLocation, setShowLocation] = useState(true);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdatingAccount(true);
    try {
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
        await updateDoc(doc(db, 'users', user.uid), { displayName: name });
      }
      if (email !== user.email) {
        await updateEmail(user, email);
        await updateDoc(doc(db, 'users', user.uid), { email: email });
      }
      toast.success('Account information updated');
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast.error(error.message || 'Failed to update account');
    } finally {
      setUpdatingAccount(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword) return;
    setUpdatingPassword(true);
    try {
      await updatePassword(user, newPassword);
      setNewPassword('');
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password. You may need to re-login.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-8 pb-24"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          
          {/* Account Settings */}
          <div className="flex flex-col">
            <div 
              onClick={() => toggleSection('account')}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                  <p className="text-sm text-gray-500">Update your email and personal details</p>
                </div>
              </div>
              {activeSection === 'account' ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
            </div>
            
            <AnimatePresence>
              {activeSection === 'account' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-gray-50 border-t border-gray-100"
                >
                  <form onSubmit={handleUpdateAccount} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Display Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={updatingAccount}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {updatingAccount ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Security */}
          <div className="flex flex-col">
            <div 
              onClick={() => toggleSection('security')}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-green-50 p-3 rounded-full text-green-600">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Security & Password</h3>
                  <p className="text-sm text-gray-500">Manage your password and security preferences</p>
                </div>
              </div>
              {activeSection === 'security' ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
            </div>

            <AnimatePresence>
              {activeSection === 'security' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-gray-50 border-t border-gray-100"
                >
                  <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                        placeholder="Enter new password"
                        minLength={6}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={updatingPassword || !newPassword}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {updatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="flex flex-col">
            <div 
              onClick={() => toggleSection('notifications')}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">Choose what updates you want to receive</p>
                </div>
              </div>
              {activeSection === 'notifications' ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
            </div>

            <AnimatePresence>
              {activeSection === 'notifications' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-gray-50 border-t border-gray-100"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive emails about your account activity</p>
                      </div>
                      <button 
                        onClick={() => setEmailNotifs(!emailNotifs)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailNotifs ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-500">Receive push notifications for new messages</p>
                      </div>
                      <button 
                        onClick={() => setPushNotifs(!pushNotifs)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pushNotifs ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pushNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <button onClick={handleSavePreferences} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                      Save Preferences
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Privacy */}
          <div className="flex flex-col">
            <div 
              onClick={() => toggleSection('privacy')}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-purple-50 p-3 rounded-full text-purple-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Privacy</h3>
                  <p className="text-sm text-gray-500">Control who can see your profile and activity</p>
                </div>
              </div>
              {activeSection === 'privacy' ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
            </div>

            <AnimatePresence>
              {activeSection === 'privacy' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-gray-50 border-t border-gray-100"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Public Profile</h4>
                        <p className="text-sm text-gray-500">Allow others to see your profile</p>
                      </div>
                      <button 
                        onClick={() => setPublicProfile(!publicProfile)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${publicProfile ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${publicProfile ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Show Location</h4>
                        <p className="text-sm text-gray-500">Display your approximate location on your ads</p>
                      </div>
                      <button 
                        onClick={() => setShowLocation(!showLocation)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showLocation ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showLocation ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <button onClick={handleSavePreferences} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                      Save Preferences
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
