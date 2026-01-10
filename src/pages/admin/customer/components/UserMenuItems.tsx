import { logout } from '@/api/auth';
import { User, LogOut, CreditCard, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';


const UserMenuItems = ({ 
  className = "" 
}) => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className={className}>
      {/* Profile Menu Item */}
      <div className="">
        <Link to={'/profile'}
          className="flex items-center cursor-pointer w-full text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 py-2"
        >
          <span className="mr-3 text-base">
            <User size={20} />
          </span>
          {'Profile'}
        </Link>
        <Link to={'/my-wallet'}
          className="flex items-center cursor-pointer w-full text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 py-2"
        >
          <span className="mr-3 text-base">
            <CreditCard size={20} />
          </span>
          {'My Wallet'}
        </Link>
        <Link to={'/chat'}
          className="flex items-center cursor-pointer w-full text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 py-2"
        >
          <span className="mr-3 text-base">
            <MessageCircle size={20} />
          </span>
          {'Chat'}
        </Link>
      </div>

      {/* Logout Menu Item */}
      <div className="border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center cursor-pointer w-full text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 py-2"
        >
          <LogOut size={20} /> 
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default UserMenuItems;