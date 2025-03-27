import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Star, Calendar, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Profile {
  id: string;
  name: string;
  bio: string;
  rating: number;
  availability: boolean;
  location: any;
  city?: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  rate: number;
}

interface Rating {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  rater: {
    name: string;
  }
}

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;
        
        if (!profileData) {
          setProfile(null);
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('profile_id', id);

        if (servicesError) throw servicesError;
        setServices(servicesData || []);

        // Fetch ratings with rater's name
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('ratings')
          .select('*, rater:profiles!ratings_rater_id_fkey(name)')
          .eq('freelancer_id', id)
          .order('created_at', { ascending: false });

        if (ratingsError) throw ratingsError;
        setRatings(ratingsData || []);

        // Check if current user has already rated
        if (user) {
          const { data: userRating, error: userRatingError } = await supabase
            .from('ratings')
            .select('id')
            .eq('freelancer_id', id)
            .eq('rater_id', user.id)
            .maybeSingle();

          if (!userRatingError) {
            setHasRated(!!userRating);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, user]);

  const handleSubmitRating = async () => {
    if (!user || !profile || newRating === 0) return;

    setSubmittingRating(true);
    setRatingError(null);

    try {
      // Check if user can rate
      const { data: canRate, error: checkError } = await supabase
        .rpc('can_rate_freelancer', { freelancer_id: profile.id });

      if (checkError) throw checkError;

      if (!canRate) {
        setRatingError("You can't rate this freelancer again or rate yourself");
        return;
      }

      // Insert new rating
      const { error: ratingError } = await supabase
        .from('ratings')
        .insert({
          freelancer_id: profile.id,
          rater_id: user.id,
          rating: newRating,
          comment: newComment.trim(),
        });

      if (ratingError) throw ratingError;

      // Refresh ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('*, rater:profiles!ratings_rater_id_fkey(name)')
        .eq('freelancer_id', profile.id)
        .order('created_at', { ascending: false });

      if (ratingsError) throw ratingsError;
      setRatings(ratingsData || []);
      setHasRated(true);
      setNewRating(0);
      setNewComment('');

      // Update profile rating
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('rating')
        .eq('id', profile.id)
        .single();

      if (updatedProfile) {
        setProfile(prev => prev ? { ...prev, rating: updatedProfile.rating } : null);
      }
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      setRatingError(error.message || 'Error submitting rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Profile not found</p>
          <Link 
            to="/for-you" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Freelancers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              {profile.city && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{profile.city}</span>
                </div>
              )}
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span>{profile.rating}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{profile.availability ? 'Available' : 'Unavailable'}</span>
              </div>
            </div>
          </div>
          {user && user.id !== profile.id && (
            <Link
              to={`/chat?with=${profile.id}`}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Message</span>
            </Link>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
          <p className="text-gray-600">{profile.bio}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <p className="text-lg font-semibold text-blue-600">${service.rate}/hr</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
          
          {user && user.id !== profile.id && !hasRated && (
            <div className="mb-8 bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rate this freelancer</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setNewRating(rating)}
                        className={`p-2 rounded-full transition ${
                          rating <= newRating
                            ? 'text-yellow-400 hover:text-yellow-500'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      >
                        <Star className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Share your experience..."
                  />
                </div>

                {ratingError && (
                  <div className="text-red-600 text-sm">
                    {ratingError}
                  </div>
                )}

                <button
                  onClick={handleSubmitRating}
                  disabled={newRating === 0 || submittingRating}
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submittingRating ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {ratings.map((rating) => (
              <div key={rating.id} className="border rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating.rating ? 'text-yellow-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-gray-900">
                      {rating.rater.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-gray-600">{rating.comment}</p>
                )}
              </div>
            ))}

            {ratings.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No reviews yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;