import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { MapPin, Star, X, Heart, MessageSquare, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Profile {
  id: string;
  name: string;
  bio: string;
  rating: number;
  location: string | null;
  services: Service[];
  distance?: number;
  city?: string;
  is_favorite?: boolean;
}

interface Service {
  id: string;
  title: string;
  description: string;
  rate: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

const ForYouPage = () => {
  const { user } = useAuth();
  const [freelancers, setFreelancers] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [userCity, setUserCity] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserCity = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('city')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserCity(profile?.city || null);
      } catch (error) {
        console.error('Error fetching user city:', error);
      }
    };

    fetchUserCity();
  }, [user]);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        // Fetch all freelancers
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*, services (*)')
          .eq('is_freelancer', true)
          .neq('id', user?.id);

        if (profilesError) throw profilesError;

        if (profiles) {
          // If user is authenticated, fetch their favorites
          let favorites: Set<string> = new Set();
          if (user) {
            const { data: favoritesData, error: favoritesError } = await supabase
              .from('favorites')
              .select('freelancer_id')
              .eq('user_id', user.id);

            if (!favoritesError && favoritesData) {
              favorites = new Set(favoritesData.map(f => f.freelancer_id));
            }
          }

          // Add is_favorite flag to profiles
          const profilesWithFavorites = profiles.map(profile => ({
            ...profile,
            is_favorite: favorites.has(profile.id)
          }));

          // Sort freelancers: same city first, then others
          const sortedProfiles = profilesWithFavorites.sort((a, b) => {
            const aInSameCity = a.city === userCity;
            const bInSameCity = b.city === userCity;
            
            if (aInSameCity && !bInSameCity) return -1;
            if (!aInSameCity && bInSameCity) return 1;
            
            // If both are in same city or both are not, sort by rating
            return (b.rating || 0) - (a.rating || 0);
          });

          setFreelancers(sortedProfiles);
        }
      } catch (error) {
        console.error('Error fetching freelancers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, [userCity, user]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentFreelancer = freelancers[currentIndex];
    
    if (direction === 'right' && user) {
      try {
        setFavoriteError(null);
        
        if (currentFreelancer.is_favorite) {
          // Remove from favorites
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('freelancer_id', currentFreelancer.id);

          if (error) throw error;

          setFreelancers(prev => prev.map(f => 
            f.id === currentFreelancer.id ? { ...f, is_favorite: false } : f
          ));
        } else {
          // Add to favorites
          const { error } = await supabase
            .from('favorites')
            .insert({
              user_id: user.id,
              freelancer_id: currentFreelancer.id
            });

          if (error) throw error;

          setFreelancers(prev => prev.map(f => 
            f.id === currentFreelancer.id ? { ...f, is_favorite: true } : f
          ));
        }
      } catch (error: any) {
        console.error('Error updating favorites:', error);
        setFavoriteError(error.message);
      }
    }

    setCurrentIndex((prev) => (prev + 1) % freelancers.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-center">Finding freelancers...</p>
        </div>
      </div>
    );
  }

  if (freelancers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Freelancers Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find any freelancers at the moment.</p>
          <Link
            to="/account"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Update your location preferences
          </Link>
        </div>
      </div>
    );
  }

  const currentFreelancer = freelancers[currentIndex];
  const imageUrl = `https://source.unsplash.com/random/800x600/?professional,portrait&sig=${currentFreelancer.id}`;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {favoriteError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {favoriteError}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300">
          {/* Profile Image */}
          <div className="relative h-64 sm:h-96">
            <img
              src={imageUrl}
              alt={currentFreelancer.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold truncate">{currentFreelancer.name}</h2>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">{currentFreelancer.rating}</span>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {currentFreelancer.city || 'Location not specified'}
                  {currentFreelancer.city === userCity && (
                    <span className="ml-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs">
                      Same City
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-4 sm:p-6">
            <p className="text-gray-700 mb-6 text-sm sm:text-base">{currentFreelancer.bio}</p>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Services</h3>
              <div className="space-y-3">
                {currentFreelancer.services?.map((service) => (
                  <div key={service.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{service.title}</h4>
                      <span className="text-blue-600 font-semibold whitespace-nowrap text-sm sm:text-base">
                        ${service.rate}/hr
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
              <button
                onClick={() => handleSwipe('left')}
                className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-white border-2 border-red-500 text-red-500 rounded-full hover:bg-red-50 transition-colors"
              >
                <X className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
              <Link
                to={`/chat?with=${currentFreelancer.id}`}
                className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-white border-2 border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
              >
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8" />
              </Link>
              <button
                onClick={() => handleSwipe('right')}
                className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-white border-2 rounded-full transition-colors ${
                  currentFreelancer.is_favorite
                    ? 'border-pink-500 text-pink-500 hover:bg-pink-50'
                    : 'border-green-500 text-green-500 hover:bg-green-50'
                }`}
              >
                <Heart className={`w-6 h-6 sm:w-8 sm:h-8 ${currentFreelancer.is_favorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center mt-4 sm:mt-6 gap-2">
          {freelancers.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForYouPage;