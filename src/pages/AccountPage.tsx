import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Settings, Camera, MapPin, DollarSign, Plus, X } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  bio: string;
  is_freelancer: boolean;
  availability: boolean;
  interests: string[];
  city?: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  rate: number;
}

const AccountPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [profile, setProfile] = useState<Profile>({
    id: '',
    name: '',
    bio: '',
    is_freelancer: false,
    availability: true,
    interests: [],
  });
  const [services, setServices] = useState<Service[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    title: '',
    description: '',
    rate: 0,
  });
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [city, setCity] = useState('');

  useEffect(() => {
    const fetchProfileAndServices = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        if (profileData) {
          setProfile(profileData);
          setCity(profileData.city || '');
        }

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('profile_id', user.id);

        if (servicesError) throw servicesError;
        if (servicesData) {
          setServices(servicesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndServices();
  }, [user]);

  const handleUpdateLocation = async (newCity: string) => {
    if (!user || !newCity.trim()) return;
    
    setIsSearching(true);
    setLocationError('');
    
    try {
      // First update the city name
      const { error: cityError } = await supabase
        .from('profiles')
        .update({ city: newCity.trim() })
        .eq('id', user.id);

      if (cityError) throw cityError;

      // Then get coordinates and update location
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newCity)}`
      );
      
      const data = await response.json();
      
      if (data && data[0]) {
        const { lat, lon } = data[0];
        
        const { error: locationError } = await supabase.rpc(
          'update_profile_location',
          {
            profile_id: user.id,
            lat: parseFloat(lat),
            lon: parseFloat(lon)
          }
        );

        if (locationError) throw locationError;

        setProfile(prev => ({
          ...prev,
          city: newCity.trim()
        }));
        setCity(newCity.trim());
        setLocationError('');
      } else {
        setLocationError('City not found. Please try a different name.');
      }
    } catch (error: any) {
      console.error('Error updating location:', error);
      setLocationError(error.message || 'Error updating location');
      
      // Revert city update if location update fails
      if (profile.city) {
        await supabase
          .from('profiles')
          .update({ city: profile.city })
          .eq('id', user.id);
        setCity(profile.city);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          bio: profile.bio,
          is_freelancer: profile.is_freelancer,
          availability: profile.availability,
          interests: profile.interests,
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async () => {
    if (!user || !newService.title.trim() || !newService.description.trim() || newService.rate <= 0) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          profile_id: user.id,
          title: newService.title.trim(),
          description: newService.description.trim(),
          rate: newService.rate,
        })
        .select();

      if (error) throw error;
      if (data) {
        setServices([...services, data[0]]);
        setNewService({ title: '', description: '', rate: 0 });
        setShowServiceForm(false);
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      setServices(services.filter(service => service.id !== serviceId));
    } catch (error) {
      console.error('Error removing service:', error);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Account Settings</h1>
                <p className="text-blue-100">Manage your profile and preferences</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your city..."
                    />
                    <button
                      onClick={() => handleUpdateLocation(city)}
                      disabled={isSearching || !city.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {isSearching ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                  {locationError && (
                    <p className="mt-1 text-sm text-red-600">{locationError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Services */}
            {profile.is_freelancer && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Services
                </h2>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="bg-gray-50 rounded-lg p-4 relative">
                      <button
                        onClick={() => handleRemoveService(service.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{service.title}</h3>
                        <span className="text-blue-600 font-semibold">${service.rate}/hr</span>
                      </div>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  ))}

                  {showServiceForm ? (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service Title
                        </label>
                        <input
                          type="text"
                          value={newService.title}
                          onChange={(e) => setNewService(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="e.g., Web Development"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newService.description}
                          onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          rows={3}
                          placeholder="Describe your service..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          value={newService.rate || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            setNewService(prev => ({ ...prev, rate: value }));
                          }}
                          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowServiceForm(false);
                            setNewService({ title: '', description: '', rate: 0 });
                          }}
                          className="px-4 py-2 text-gray-700 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddService}
                          disabled={!newService.title.trim() || !newService.description.trim() || newService.rate <= 0}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Service
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowServiceForm(true)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Service
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Interests */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Interests & Skills
              </h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                    className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add a skill or interest..."
                  />
                  <button
                    onClick={handleAddInterest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {interest}
                      <button
                        onClick={() => handleRemoveInterest(interest)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Freelancer Status</h3>
                    <p className="text-sm text-gray-500">Show up in freelancer searches</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.is_freelancer}
                      onChange={(e) => setProfile(prev => ({ ...prev, is_freelancer: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Availability</h3>
                    <p className="text-sm text-gray-500">Show as available for new projects</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.availability}
                      onChange={(e) => setProfile(prev => ({ ...prev, availability: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;