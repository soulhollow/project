import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AGBPopupProps {
  onAccept: () => void;
}

const AGBPopup: React.FC<AGBPopupProps> = ({ onAccept }) => {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ agb_accepted: true })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      onAccept();
    } catch (error) {
      console.error('Error updating AGB acceptance:', error);
      // Show error message to user
      alert('Failed to accept terms. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Terms and Conditions</h2>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mb-4">1. General Terms</h3>
            <p className="mb-4">
              Welcome to FreelanceLocal. By using our service, you agree to these terms and conditions.
              These terms govern your use of our platform and the services provided through it.
            </p>

            <h3 className="text-lg font-semibold mb-4">2. User Obligations</h3>
            <p className="mb-4">
              Users must provide accurate information and maintain the confidentiality of their account.
              You are responsible for all activities that occur under your account.
            </p>

            <h3 className="text-lg font-semibold mb-4">3. Service Description</h3>
            <p className="mb-4">
              FreelanceLocal provides a platform connecting freelancers with clients. We do not guarantee
              the quality, safety, or legality of services offered through our platform.
            </p>

            <h3 className="text-lg font-semibold mb-4">4. Payments and Fees</h3>
            <p className="mb-4">
              All payments are processed securely. FreelanceLocal may charge service fees for using the
              platform. Detailed fee information is provided during the booking process.
            </p>

            <h3 className="text-lg font-semibold mb-4">5. Privacy</h3>
            <p className="mb-4">
              We collect and process personal data as described in our Privacy Policy. By using our
              service, you consent to our data practices.
            </p>

            <h3 className="text-lg font-semibold mb-4">6. Intellectual Property</h3>
            <p className="mb-4">
              Users retain their intellectual property rights. By posting content, you grant
              FreelanceLocal a license to use it for platform purposes.
            </p>

            <h3 className="text-lg font-semibold mb-4">7. Liability</h3>
            <p className="mb-4">
              FreelanceLocal is not liable for disputes between users. We provide the platform but do
              not guarantee outcomes of freelancer-client relationships.
            </p>

            <h3 className="text-lg font-semibold mb-4">8. Termination</h3>
            <p className="mb-4">
              We reserve the right to terminate accounts that violate these terms or for any other
              reason at our discretion.
            </p>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex justify-end gap-4">
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isAccepting ? 'Accepting...' : 'Accept Terms'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AGBPopup;