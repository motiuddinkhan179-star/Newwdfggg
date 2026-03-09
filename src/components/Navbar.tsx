import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getSuggestions } from '../services/listingService';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [location, setLocation] = useState<string | null>(searchParams.get('location'));
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setLocation(searchParams.get('location'));
  }, [searchParams]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length > 1) {
        const results = await getSuggestions(searchTerm);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    if (window.location.pathname !== '/') {
        navigate(`/?${params.toString()}`);
    } else {
        setSearchParams(params);
    }
    setShowSuggestions(false);
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            const city = data.city || data.locality || data.principalSubdivision || "Unknown Location";
            
            setLocation(city);
            
            const params = new URLSearchParams(searchParams);
            params.set('location', city);
            params.delete('lat');
            params.delete('lng');
            setSearchParams(params);
            
            if (window.location.pathname !== '/') {
                navigate(`/?${params.toString()}`);
            }
          } catch (error) {
            console.error("Error fetching city:", error);
            setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
            const params = new URLSearchParams(searchParams);
            params.set('lat', latitude.toString());
            params.set('lng', longitude.toString());
            setSearchParams(params);
            
            if (window.location.pathname !== '/') {
                navigate(`/?${params.toString()}`);
            }
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not detect location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 z-50">
      <div className="px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-black text-indigo-600 tracking-tighter">OLX</span>
            </Link>
          </div>
          
          {/* Location */}
          <div className="flex items-center space-x-2">
             <button onClick={handleLocationClick} className="p-2 text-gray-600 flex items-center">
               <MapPin className="h-5 w-5" />
               {location && <span className="text-xs font-medium ml-1 truncate max-w-[100px]">{location}</span>}
             </button>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 pb-3 relative" ref={searchRef}>
        <div className="relative">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search className="h-5 w-5 text-gray-400" />
           </div>
           <input
             type="text"
             className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
             placeholder="Find Cars, Mobile Phones and more..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             onFocus={() => {
               if (suggestions.length > 0) setShowSuggestions(true);
             }}
           />
           {/* Suggestions Dropdown */}
           {showSuggestions && suggestions.length > 0 && (
             <div className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 border border-gray-200 max-h-60 overflow-y-auto">
               {suggestions.map((suggestion, index) => (
                 <div
                   key={index}
                   className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"
                   onClick={() => handleSearch(suggestion)}
                 >
                   {suggestion}
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </nav>
  );
}
