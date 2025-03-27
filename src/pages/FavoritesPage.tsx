import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { MapPin, Star, MessageSquare, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Profile {
  id: string;
  name: string;
  bio: string;
  rating: number;
  city?: string;
  services: Service[];
}

interface Service {
  id: string;
  title: string;
  description: string;
  rate: number;
}

const FavoritesPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('favorites')
          .select(`
            freelancer_id,
            freelancer:profiles!favorites_freelancer_id_fkey (
              id,
              name,
              bio,
              rating,
              city,
              services (*)
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        if (data) {
          setFavorites(data.map(f => f.freelancer));
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (freelancerId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('freelancer_id', freelancerId);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.id !== freelancerId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't added any freelancers to your favorites list.
            </p>
            <Link
              to="/for-you"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Discover Freelancers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
          Your Favorites
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
          {favorites.map((freelancer) => {
            const imageUrl = `https://source.unsplash.com/random/400x300/?professional,portrait&sig=${freelancer.id}`;
            
            return (
              <div key={freelancer.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={imageUrl}
                    alt={freelancer.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h2 className="text-lg sm:text-xl font-bold mb-1 truncate">{freelancer.name}</h2>
                    <div className="flex items-center text-sm">
                      {freelancer.city && (
                        <div className="flex items-center mr-3">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{freelancer.city}</span>
                        </div>
                      )}
                      <div className="flex items-center flex-shrink-0">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{freelancer.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {freelancer.bio}
                  </p>

                  <div className="space-y-2">
                    {freelancer.services.slice(0, 2).map((service) => (
                      <div key={service.id} className="bg-gray-50 rounded-lg p-2 text-sm">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-medium text-gray-900 truncate">{service.title}</span>
                          <span className="text-blue-600 font-semibold whitespace-nowrap">
                            ${service.rate}/hr
                          </span>
                        </div>
                      </div>
                    ))}
                    {freelancer.services.length > 2 && (
                      <div className="text-sm text-gray-500 text-center">
                        +{freelancer.services.length - 2} more services
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/profile/${freelancer.id}`}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition text-center text-sm sm:text-base"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={`/chat?with=${freelancer.id}`}
                      className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleRemoveFavorite(freelancer.id)}
                      className="flex items-center justify-center bg-white border border-red-300 text-red-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-red-50 transition"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;