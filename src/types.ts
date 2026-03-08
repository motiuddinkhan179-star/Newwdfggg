export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerPhotoURL?: string;
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'sold' | 'deleted';
}
