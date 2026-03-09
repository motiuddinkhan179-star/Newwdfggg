import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, User, MessageCircle, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/') ? 'text-indigo-600' : 'text-gray-500'
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link
          to="/chat"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/chat') ? 'text-indigo-600' : 'text-gray-500'
          }`}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Chat</span>
        </Link>

        <Link
          to="/create-listing"
          className="flex flex-col items-center justify-center w-full h-full relative"
        >
          <div className="absolute -top-5 bg-white rounded-full p-1 border-t border-gray-200">
             <div className="bg-indigo-600 rounded-full p-3 shadow-lg">
                <PlusCircle className="h-6 w-6 text-white" />
             </div>
          </div>
          <span className="text-xs mt-8 text-gray-500 font-medium">Sell</span>
        </Link>

        <Link
          to="/favorites"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/favorites') ? 'text-indigo-600' : 'text-gray-500'
          }`}
        >
          <Heart className="h-6 w-6" />
          <span className="text-xs mt-1">Favorites</span>
        </Link>

        <Link
          to={user ? "/profile" : "/login"}
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/profile') || isActive('/login') ? 'text-indigo-600' : 'text-gray-500'
          }`}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Account</span>
        </Link>
      </div>
    </div>
  );
}
