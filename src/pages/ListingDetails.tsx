import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingById } from '../services/listingService';
import { createConversation } from '../services/chatService';
import { toggleLikeListing, toggleFollowUser } from '../services/userService';
import { Listing } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Share2, Heart, MessageCircle, MapPin, Calendar, UserPlus, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        const data = await getListingById(id);
        setListing(data);
      } catch (err) {
        setError('Failed to load listing details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleChat = async () => {
    if (!user) {
      toast.error('Please log in to chat with the seller');
      navigate('/login');
      return;
    }
    if (!listing) return;
    
    setCreatingChat(true);
    try {
      // Create or get existing conversation
      const conversationId = await createConversation([user.uid, listing.sellerId], listing.id);
      navigate(`/chat?conversationId=${conversationId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to start chat. Please try again.");
    } finally {
      setCreatingChat(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: `Check out this ${listing?.title} on our app!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleLike = async () => {
    if (!user || !listing) {
      toast.error('Please login to like listings');
      return;
    }
    
    const isLiked = userProfile?.likedListings?.includes(listing.id) || false;
    try {
      await toggleLikeListing(user.uid, listing.id, isLiked);
      toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !listing) {
      toast.error('Please login to follow sellers');
      return;
    }
    
    if (user.uid === listing.sellerId) {
      toast.error("You can't follow yourself");
      return;
    }

    const isFollowing = userProfile?.following?.includes(listing.sellerId) || false;
    try {
      await toggleFollowUser(user.uid, listing.sellerId, isFollowing);
      toast.success(isFollowing ? 'Unfollowed seller' : 'Following seller');
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (error || !listing) return <div className="text-center py-12 text-red-600">{error || 'Listing not found'}</div>;

  const isLiked = userProfile?.likedListings?.includes(listing.id) || false;
  const isFollowing = userProfile?.following?.includes(listing.sellerId) || false;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 min-h-screen pb-24 md:pb-12"
    >
      {/* Mobile Header */}
      <div className="sticky top-0 left-0 right-0 z-20 flex justify-between items-center p-4 pointer-events-none">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-700 hover:bg-white pointer-events-auto transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex space-x-3 pointer-events-auto">
          <button onClick={handleShare} className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-md text-gray-700 hover:bg-white transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <button onClick={handleLike} className={`p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-md transition-colors ${isLiked ? 'text-red-500' : 'text-gray-700 hover:bg-white hover:text-red-500'}`}>
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto md:px-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-black md:rounded-2xl overflow-hidden shadow-lg group"
          >
            <div className="aspect-w-4 aspect-h-3 md:aspect-w-16 md:aspect-h-12">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="object-contain w-full h-full bg-gray-100"
                />
              ) : (
                <div className="flex items-center justify-center h-72 md:h-[500px] text-gray-400 bg-gray-100">
                  <span className="text-lg">No Image Available</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="px-5 py-6 md:px-0 md:py-2"
          >
            <div className="bg-white md:bg-transparent rounded-2xl md:rounded-none p-6 md:p-0 shadow-sm md:shadow-none border border-gray-100 md:border-none">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
                  <div className="flex flex-wrap items-center mt-3 text-sm text-gray-500 gap-y-2">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium text-xs mr-3">{listing.category}</span>
                    <span className="flex items-center mr-3"><MapPin className="h-3.5 w-3.5 mr-1" /> {listing.location || 'Nearby'}</span>
                    <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" /> {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="hidden md:flex space-x-2">
                  <button onClick={handleShare} className="p-2.5 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button onClick={handleLike} className={`p-2.5 rounded-full transition-colors ${isLiked ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-red-500'}`}>
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="mt-6 mb-8">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">${listing.price.toLocaleString()}</h2>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <div className="prose prose-indigo text-gray-600 leading-relaxed max-w-none">
                  <p className="whitespace-pre-line">{listing.description}</p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h3>
                <div className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex-shrink-0 relative">
                    {listing.sellerPhotoURL ? (
                      <img className="h-16 w-16 rounded-full border-2 border-indigo-100 object-cover" src={listing.sellerPhotoURL} alt="" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
                        {listing.sellerName ? listing.sellerName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="ml-5 flex-1">
                    <div className="text-lg font-bold text-gray-900">{listing.sellerName || 'Anonymous Seller'}</div>
                    <div className="text-sm text-gray-500 flex items-center mt-0.5">
                      <span>Member since {new Date(listing.createdAt).getFullYear()}</span>
                    </div>
                  </div>
                  {user?.uid !== listing.sellerId && (
                    <button 
                      onClick={handleFollow}
                      className={`p-2 rounded-full transition-colors ${
                        isFollowing 
                          ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={isFollowing ? 'Unfollow' : 'Follow'}
                    >
                      {isFollowing ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar for Mobile */}
      {user?.uid !== listing.sellerId && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-30 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 active:scale-[0.98] transition-all"
            onClick={handleChat}
            disabled={creatingChat}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            {creatingChat ? 'Starting Chat...' : 'Chat with Seller'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
