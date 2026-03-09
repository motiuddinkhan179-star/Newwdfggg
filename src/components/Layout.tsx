import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const isListingDetails = location.pathname.startsWith('/listing/');
  const isCreateListing = location.pathname === '/create-listing';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center sm:p-4">
      <div className="w-full sm:w-[400px] bg-gray-50 h-[100dvh] sm:h-[800px] sm:rounded-[2.5rem] sm:shadow-2xl relative flex flex-col overflow-hidden sm:border-[8px] sm:border-black">
        {/* Navbar */}
        {!isAuthPage && (
          <div className={`${isListingDetails ? 'hidden' : 'block'} flex-shrink-0 z-20`}>
            <Navbar />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide relative z-10">
          <Outlet />
        </main>

        {/* BottomNav */}
        {!isListingDetails && !isCreateListing && !isAuthPage && (
          <div className="flex-shrink-0 z-20">
            <BottomNav />
          </div>
        )}
      </div>
    </div>
  );
}
