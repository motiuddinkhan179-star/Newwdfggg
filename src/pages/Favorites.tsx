import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getListings } from '../services/listingService';
import { toggleLikeListing } from '../services/userService';
import { Listing } from '../types';
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Favorites() {
  const { user, userProfile } = useAuth();
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user && userProfile?.likedListings && userProfile.likedListings.length > 0) {
        try {
          // Fetch all listings and filter. In a real app, you'd want a specific query for this.
          const { listings } = await getListings();
          const favorites = listings.filter(listing => userProfile.likedListings?.includes(listing.id));
          setFavoriteListings(favorites);
        } catch (error) {
          console.error('Error fetching favorites:', error);
          toast.error('Failed to load your favorite listings');
        } finally {
          setLoading(false);
        }
      } else {
        setFavoriteListings([]);
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, userProfile?.likedListings]);

  const handleLike = async (e: React.MouseEvent, listingId: string) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await toggleLikeListing(user.uid, listingId, true); // true because it's already liked if it's here
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing like:', error);
      toast.error('Failed to update favorites');
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
          Favorites <span className="ml-3 bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">{favoriteListings.length}</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : favoriteListings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4 flex items-center justify-center">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No favorites yet</h3>
            <p className="mt-1 text-gray-500">Listings you like will appear here.</p>
            <div className="mt-6">
              <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                Browse Ads
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favoriteListings.map((listing, index) => (
              <motion.div 
                key={listing.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group relative"
              >
                <Link to={`/listing/${listing.id}`} className="block">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    {listing.images && listing.images.length > 0 ? (
                      <img src={listing.images[0]} alt={listing.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-gray-900 truncate pr-4">${listing.price.toLocaleString()}</h3>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1 truncate">{listing.title}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {listing.location || 'Nearby'}
                    </div>
                  </div>
                </Link>
                <button 
                  onClick={(e) => handleLike(e, listing.id)}
                  className="absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all duration-200 hover:scale-110 bg-white text-red-500 opacity-100"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
