import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, MessageSquare } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">
          Connect with Top Freelancers in Your Area
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Find local talent for your projects or showcase your skills to potential clients.
          Join our community of professionals today.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/auth"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/for-you"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition"
          >
            Browse Freelancers
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Find Local Talent</h3>
            <p className="text-gray-600">
              Connect with skilled professionals in your area for in-person collaboration.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Verified Profiles</h3>
            <p className="text-gray-600">
              Browse through verified freelancer profiles with detailed portfolios and reviews.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Real-time Chat</h3>
            <p className="text-gray-600">
              Communicate directly with freelancers through our built-in messaging system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;