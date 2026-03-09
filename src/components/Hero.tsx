import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="relative bg-indigo-600 overflow-hidden rounded-3xl mb-8 mx-1 shadow-2xl shadow-indigo-200">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Background pattern"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 mix-blend-multiply opacity-90" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 opacity-10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-50 text-sm font-medium mb-6"
        >
          <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
          <span>The #1 Marketplace for Everything</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6 drop-shadow-sm"
        >
          Buy & Sell <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">Near You</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2 max-w-2xl mx-auto text-lg md:text-xl text-indigo-100 mb-10 leading-relaxed"
        >
          Discover the best deals on electronics, fashion, vehicles, and more in your local community. Safe, fast, and easy.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="w-full max-w-3xl"
        >
          <form onSubmit={handleSearch} className="relative flex items-center group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-32 py-5 border-0 rounded-full leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 sm:text-lg shadow-xl transition-all"
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
              <button
                type="submit"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Search
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-indigo-100"
        >
          <span className="opacity-70">Trending Searches:</span>
          {['iPhone 15', 'Honda Civic', 'Sofa Set', 'MacBook'].map((term) => (
            <button 
              key={term}
              onClick={() => navigate(`/?search=${term}`)}
              className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 transition-all hover:scale-105"
            >
              {term}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
