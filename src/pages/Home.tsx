import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListings } from '../services/listingService';
import { Listing } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Fresh Recommendations</h1>
      
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No listings found. Be the first to sell something!</p>
          <Link to="/create-listing" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 font-medium">
            Post an Ad
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <Link key={listing.id} to={`/listing/${listing.id}`} className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
              <div className="aspect-w-4 aspect-h-3 bg-gray-200 relative">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="object-cover w-full h-48 group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-100 text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                  {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{listing.title}</h3>
                <p className="text-xl font-bold text-gray-900 mt-1">${listing.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1 truncate">{listing.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{listing.category}</span>
                  <span className="text-xs text-gray-400">By {listing.sellerName || 'Unknown'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
