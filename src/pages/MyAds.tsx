import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getListingsByUser, deleteListing } from '../services/listingService';
import { Listing } from '../types';
import { Link } from 'react-router-dom';
import { Trash2, MapPin, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function MyAds() {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      if (user) {
        try {
          const listings = await getListingsByUser(user.uid);
          setMyListings(listings);
        } catch (error) {
          console.error('Error fetching my listings:', error);
          toast.error('Failed to load your listings');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMyListings();
  }, [user]);

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      try {
        await deleteListing(listingId);
        setMyListings(prev => prev.filter(l => l.id !== listingId));
        toast.success('Listing deleted successfully');
      } catch (error) {
        console.error('Error deleting listing:', error);
        toast.error('Failed to delete listing');
      }
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 md:pb-12 bg-gray-50 min-h-screen"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          My Ads <span className="ml-3 bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">{myListings.length}</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : myListings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No active listings</h3>
            <p className="mt-1 text-gray-500">You haven't posted any ads yet.</p>
            <div className="mt-6">
              <Link to="/create-listing" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                Post an Ad
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {myListings.map((listing, index) => (
              <motion.div 
                key={listing.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    {listing.images && listing.images.length > 0 ? (
                      <img src={listing.images[0]} alt={listing.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      to={`/edit-listing/${listing.id}`}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-indigo-600 hover:bg-indigo-50 shadow-sm transition-colors"
                      title="Edit Ad"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteListing(listing.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-600 hover:bg-red-50 shadow-sm transition-colors"
                      title="Delete Ad"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900 truncate pr-4">${listing.price.toLocaleString()}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-1 truncate">{listing.title}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {listing.location || 'Nearby'}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Link to={`/listing/${listing.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      View Details
                    </Link>
                    <span className="text-xs text-gray-400">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
