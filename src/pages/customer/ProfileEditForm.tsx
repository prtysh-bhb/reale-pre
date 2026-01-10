import { getProfile, updateAvatar, updateProfile } from '@/api/auth';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/context/AuthContext';
import { handleKeyPress } from '@/helpers/customer_helper';
import { Camera } from 'lucide-react';
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
}

const ProfileEditForm = () => {
  const {setUser} = useAuth();
  const [avatar, setAvatar] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    zipcode: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
        const data = await getProfile();
        const user = data.data.user;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zipcode: user.zipcode || '',
        });
        setUser(user);
        setAvatar(user.avatar_url || '');
        setLoading(false);
    };

    fetchUser();
  }, []);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setAvatar(previewUrl);
      };
      reader.readAsDataURL(file);

      const response = await updateAvatar(file);
    
      if(response.success){
        toast.success(response.message);
      }else{
        toast.error(response.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await updateProfile(formData);

    if(response.success){      
      setUser(response.data.user);
      toast.success(response.message);
      navigate("/profile");
    }else{
      toast.error(response.message);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
        <Loader />
    );
  }

  return (
    <>
    <div className="bg-gray-50 mt-4 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
              <p className="text-blue-100">Update your personal information</p>
            </div>
            <button 
              className="text-white hover:text-blue-200 transition"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img 
                id="avatar-preview" 
                src={avatar || "/assets/user.jpg"} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "/assets/user.jpg";
                }}
              />
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition shadow-md"
              >
                <Camera />
                <input 
                  id="avatar-upload" 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </button>
            </div>
            <p className="text-gray-600 mt-2 text-sm">Click the camera icon to change photo</p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, /[a-zA-Z ]/, false)}
                  maxLength={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  disabled
                  maxLength={50}
                  value={formData.email}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, /[a-z0-9@._-]/, false)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                maxLength={15}
                value={formData.phone}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, /[0-9+()-]/, false)}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                maxLength={255}
                value={formData.address}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, /[a-z0-9@._-\s]/, false)}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  maxLength={50}
                  value={formData.city}
                  onChange={handleInputChange}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, /[a-zA-Z ]/, false)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  maxLength={50}
                  value={formData.state}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, /[a-zA-Z ]/, false)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Zip Code */}
              <div>
                <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  id="zipcode"
                  maxLength={10}
                  value={formData.zipcode}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, /[0-9]/, false)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t rounded-md border-gray-200 flex justify-between">
          <Link to={"/profile"}
            type="button"
            className="px-3 py-2 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-3 py-2 cursor-pointer bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
          >
            <i className="fas fa-save mr-2"></i>
            Save Changes
          </button>
        </div>
          </form>
        </div>

      </div>
    </div>
    </>
  );
};

export default ProfileEditForm;