import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getListingById } from '../services/listingService';
import { Listing } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error || !listing) return <div className="text-center py-12 text-red-600">{error || 'Listing not found'}</div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-lg overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 text-gray-400">
                No Image Available
              </div>
            )}
          </div>
          {/* Thumbnails could go here */}
        </div>

        {/* Details */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Posted {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })} in {listing.category}
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {listing.status}
            </span>
          </div>

          <div className="mt-6">
            <h2 className="text-4xl font-bold text-gray-900">${listing.price.toLocaleString()}</h2>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <div className="mt-2 prose prose-indigo text-gray-500">
              <p>{listing.description}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900">Seller Information</h3>
            <div className="mt-4 flex items-center">
              <div className="flex-shrink-0">
                {listing.sellerPhotoURL ? (
                  <img className="h-12 w-12 rounded-full" src={listing.sellerPhotoURL} alt="" />
                ) : (
                  <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="ml-4">
                <div className="text-lg font-medium text-gray-900">{listing.sellerName || 'Anonymous Seller'}</div>
                <div className="text-sm text-gray-500">Member since {new Date(listing.createdAt).getFullYear()}</div>
              </div>
            </div>
            
            {user?.uid !== listing.sellerId && (
               <div className="mt-6">
                 <button
                   className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                   onClick={() => alert('Chat feature coming soon!')}
                 >
                   Contact Seller
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
