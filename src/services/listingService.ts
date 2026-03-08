import { Listing } from '../types';
import { DocumentSnapshot } from 'firebase/firestore';

// Mock data service since Firestore is disabled

const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'iPhone 13 Pro',
    description: 'Like new, 128GB, Graphite. Comes with box and cable.',
    price: 799,
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80'],
    sellerId: 'mock-seller-1',
    sellerName: 'John Doe',
    createdAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: '2',
    title: 'Mountain Bike',
    description: 'Trek Marlin 5, used for one season. Great condition.',
    price: 450,
    category: 'Sports',
    images: ['https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=800&q=80'],
    sellerId: 'mock-seller-2',
    sellerName: 'Jane Smith',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'active'
  },
  {
    id: '3',
    title: 'Leather Sofa',
    description: 'Brown leather sofa, 3 seater. Very comfortable.',
    price: 300,
    category: 'Home & Garden',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
    sellerId: 'mock-seller-3',
    sellerName: 'Mike Johnson',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'active'
  }
];

export const createListing = async (listing: Omit<Listing, 'id'>) => {
  console.log('Mock create listing:', listing);
  return 'mock-new-id';
};

export const getListings = async (lastVisible?: DocumentSnapshot) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { listings: MOCK_LISTINGS, lastVisible: undefined };
};

export const getListingById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const listing = MOCK_LISTINGS.find(l => l.id === id);
  if (listing) {
    return listing;
  } else {
    throw new Error('Listing not found');
  }
};

export const updateListing = async (id: string, updates: Partial<Listing>) => {
  console.log('Mock update listing:', id, updates);
};

export const deleteListing = async (id: string) => {
  console.log('Mock delete listing:', id);
};

export const uploadImage = async (file: File, path: string) => {
  console.log('Mock upload image:', file.name);
  return URL.createObjectURL(file);
};
