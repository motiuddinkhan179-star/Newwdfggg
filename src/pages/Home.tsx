import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getListings } from '../services/listingService';
import { toggleLikeListing } from '../services/userService';
import { Listing } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MapPin, Tag, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import Hero from '../components/Hero';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const CATEGORIES = [
  { name: 'Electronics', icon: '📱', color: 'bg-blue-100 text-blue-600' },
  { name: 'Vehicles', icon: '🚗', color: 'bg-red-100 text-red-600' },
  { name: 'Property', icon: '🏠', color: 'bg-green-100 text-green-600' },
  { name: 'Fashion', icon: '👗', color: 'bg-pink-100 text-pink-600' },
  { name: 'Sports', icon: '⚽', color: 'bg-orange-100 text-orange-600' },
  { name: 'Furniture', icon: '🪑', color: 'bg-amber-100 text-amber-600' },
  { name: 'Jobs', icon: '💼', color: 'bg-purple-100 text-purple-600' },
  { name: 'Services', icon: '🔧', color: 'bg-gray-100 text-gray-600' },
];

const ListingSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse flex flex-col h-full">
    <div className="aspect-w-4 aspect-h-3 bg-gray-200"></div>
    <div className="p-4 space-y-3 flex-1">
      <div className="flex justify-between">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 pt-2"></div>
    </div>
  </div>
);

export default function Home() {
  const { user, userProfile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const locationFilter = searchParams.get('location');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { listings } = await getListings();
        setListings(listings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleLike = async (e: React.MouseEvent, listingId: string) => {
    e.preventDefault(); // Prevent navigating to listing details
    if (!user) {
      toast.error('Please login to like listings');
      return;
    }
    
    const isLiked = userProfile?.likedListings?.includes(listingId) || false;
    try {
      await toggleLikeListing(user.uid, listingId, isLiked);
      toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update favorites');
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Location filtering
    let matchesLocation = true;
    if (locationFilter) {
      matchesLocation = listing.location ? listing.location.toLowerCase().includes(locationFilter.toLowerCase()) : false;
    } else if (lat && lng) {
       // Fallback for lat/lng if no city name (mock)
       matchesLocation = listing.location === 'Nearby';
    }

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="space-y-8 pb-24">
      <Hero />

      {/* Categories Scroll */}
      <div className="relative">
        <div className="flex items-center justify-between px-1 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Browse Categories</h2>
          <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">See all</button>
        </div>
        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          <div className="flex space-x-4 min-w-max px-2">
            {CATEGORIES.map((cat, index) => (
              <motion.div 
                key={cat.name} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center space-y-2 cursor-pointer group snap-center"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-transparent group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 ${cat.color}`}>
                  {cat.icon}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6 px-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
            {searchTerm ? `Results for "${searchTerm}"` : (
              <>
                <span className="mr-2">🔥</span> Fresh Recommendations
              </>
            )}
          </h1>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => <ListingSkeleton key={i} />)}
          </div>
        ) : filteredListings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 mx-1 flex flex-col items-center"
          >
            <div className="text-6xl mb-4 bg-gray-50 p-6 rounded-full">🔍</div>
            <h3 className="text-xl font-bold text-gray-900">No listings found</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">We couldn't find what you're looking for. Try adjusting your search or filters.</p>
            <Link to="/create-listing" className="mt-8 inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-1">
              Start Selling
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="h-full"
              >
                <Link to={`/listing/${listing.id}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-100 relative transform hover:-translate-y-1 h-full flex flex-col">
                  <div className="aspect-w-4 aspect-h-3 bg-gray-100 relative overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50 text-gray-300">
                        <span className="text-4xl">📷</span>
                      </div>
                    )}
                    <button 
                      onClick={(e) => handleLike(e, listing.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all duration-200 hover:scale-110 ${
                        userProfile?.likedListings?.includes(listing.id) 
                          ? 'bg-white text-red-500 opacity-100' 
                          : 'bg-white/90 backdrop-blur-sm text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${userProfile?.likedListings?.includes(listing.id) ? 'fill-current' : ''}`} />
                    </button>
                    {listing.status === 'sold' && (
                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                          <span className="text-white font-bold uppercase tracking-widest border-2 border-white px-4 py-1 rounded-md transform -rotate-12 shadow-lg">SOLD</span>
                       </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent h-1/2 opacity-60"></div>
                    <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center shadow-sm">
                      <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {listing.location || 'Nearby'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate pr-2">${listing.price.toLocaleString()}</h3>
                      <div className="flex items-center text-[10px] text-gray-400 whitespace-nowrap pt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(listing.createdAt))} ago
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate font-medium mb-3 line-clamp-2">{listing.title}</p>
                    <div className="mt-auto flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
                      <span className="truncate bg-gray-50 px-2 py-1 rounded-md border border-gray-100 flex items-center">
                        <Tag className="w-3 h-3 mr-1 text-gray-400" />
                        {listing.category}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
