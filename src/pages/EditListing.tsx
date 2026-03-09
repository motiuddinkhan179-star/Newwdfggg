import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getListingById, updateListing, uploadImage } from '../services/listingService';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const editListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  category: z.string().min(1, 'Please select a category'),
  location: z.string().min(3, 'Location is required'),
  condition: z.string().min(1, 'Please select condition'),
  status: z.string().min(1, 'Please select status'),
});

type EditListingForm = z.infer<typeof editListingSchema>;

const CATEGORIES = ['Electronics', 'Vehicles', 'Property', 'Fashion', 'Sports', 'Furniture', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const STATUSES = ['active', 'sold', 'deleted'];

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditListingForm>({
    resolver: zodResolver(editListingSchema),
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        const listing = await getListingById(id);
        if (listing.sellerId !== user?.uid) {
          toast.error('You do not have permission to edit this listing');
          navigate('/my-ads');
          return;
        }
        reset({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          location: listing.location || '',
          condition: listing.condition,
          status: listing.status,
        });
        if (listing.images && listing.images.length > 0) {
          setExistingImages(listing.images);
          setImagePreview(listing.images[0]);
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast.error('Failed to load listing details');
        navigate('/my-ads');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, user, reset, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImages([file]);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: EditListingForm) => {
    if (!user || !id) return;

    try {
      let uploadedImageUrls = [...existingImages];
      
      if (images.length > 0) {
        uploadedImageUrls = []; // Replace existing image for simplicity in this demo
        for (const file of images) {
          try {
            const url = await uploadImage(file, `listings/${user.uid}/${Date.now()}_${file.name}`);
            uploadedImageUrls.push(url);
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            toast.error(`Failed to upload image: ${file.name}`);
          }
        }
      }

      await updateListing(id, {
        ...data,
        status: data.status as "active" | "sold" | "deleted",
        images: uploadedImageUrls,
      });
      
      toast.success('Listing updated successfully!');
      navigate('/my-ads');
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 py-8 pb-24"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 px-6 py-8 text-white text-center">
          <h1 className="text-3xl font-bold">Edit Listing</h1>
          <p className="text-indigo-100 mt-2">Update your item details</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors cursor-pointer bg-gray-50 hover:bg-indigo-50 group relative">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="mx-auto h-48 object-cover rounded-lg shadow-md" />
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        setImagePreview(null);
                        setImages([]);
                        setExistingImages([]);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <Camera className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                {...register('category')}
                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Condition</label>
              <select
                {...register('condition')}
                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
              >
                <option value="">Select condition</option>
                {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
              {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>}
            </div>
          </div>

          {/* Price & Location */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className="block w-full pl-7 rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('location')}
                  className="block w-full pl-10 rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              {...register('status')}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
            >
              {STATUSES.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Updating...
                </>
              ) : (
                'Update Ad'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
