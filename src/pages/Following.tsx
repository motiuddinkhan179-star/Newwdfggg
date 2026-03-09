import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, toggleFollowUser } from '../services/userService';
import { Link } from 'react-router-dom';
import { User, UserMinus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface FollowedUser {
  uid: string;
  displayName?: string;
  photoURL?: string;
}

export default function Following() {
  const { user, userProfile } = useAuth();
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (user && userProfile?.following && userProfile.following.length > 0) {
        try {
          const promises = userProfile.following.map(uid => getUserProfile(uid).then(data => data ? { uid, ...data } as FollowedUser : null));
          const results = await Promise.all(promises);
          setFollowedUsers(results.filter(Boolean) as FollowedUser[]);
        } catch (error) {
          console.error('Error fetching following:', error);
          toast.error('Failed to load followed sellers');
        } finally {
          setLoading(false);
        }
      } else {
        setFollowedUsers([]);
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [user, userProfile?.following]);

  const handleUnfollow = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      await toggleFollowUser(user.uid, targetUserId, true); // true because they are currently followed
      toast.success('Unfollowed seller');
    } catch (error) {
      console.error('Error unfollowing:', error);
      toast.error('Failed to unfollow seller');
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 md:pb-12 bg-gray-50 min-h-screen"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          Following <span className="ml-3 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">{followedUsers.length}</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : followedUsers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4 flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Not following anyone</h3>
            <p className="mt-1 text-gray-500">Sellers you follow will appear here.</p>
            <div className="mt-6">
              <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                Browse Ads
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {followedUsers.map((followedUser, index) => (
              <motion.div 
                key={followedUser.uid} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                    {followedUser.photoURL ? (
                      <img src={followedUser.photoURL} alt={followedUser.displayName || 'User'} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-indigo-600 font-bold text-lg">
                        {followedUser.displayName ? followedUser.displayName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{followedUser.displayName || 'Anonymous User'}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => handleUnfollow(followedUser.uid)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Unfollow"
                >
                  <UserMinus className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
