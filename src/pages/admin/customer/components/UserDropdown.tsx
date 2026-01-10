import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import UserMenuItems from './UserMenuItems';
import { useAuth } from '@/context/AuthContext';
import { deleteNotification, getNotifications, getUnreadNotificationsCount, markAllAsReadNotification, markAsReadNotification, NotificationItem } from "@/api/public/notifications";
import echo from "@/lib/echo";
import Notifications from '@/components/layout/admin/Notifications';

interface HeaderProps{
    scrolled: boolean;
}

const UserDropdown = ({ scrolled }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const {user} = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if(!user?.id) return;
    
    echo.private(`notified.${user?.id}`)
    .listen(".notified", () => {
      fetchNotifications();
    });
  }, [user?.id]);

    const fetchNotifications = async() => {
    try {
      const notification_response = await getNotifications();
      const unread_response = await getUnreadNotificationsCount();
      setNotifications(notification_response.notifications);
      setUnreadCount(unread_response.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadNotification(id);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error in set to read notifications:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadNotification();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className='flex items-center'>
      {/* Notifications */}
      <Notifications
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
          customClass={scrolled ? "text-black hover:text-blue-600" : "text-white hover:text-blue-600"}
      />

      {/* User with dropdown */}
      <div className="relative " ref={dropdownRef}>

        {/* Username Button with Dropdown Arrow */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx("flex items-center space-x-1 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer",
          scrolled ? "text-black hover:text-blue-600" : "text-white hover:text-blue-600")}
          aria-label="User menu"
          aria-expanded={isOpen}
        >
          <span className="font-medium capitalize">Hi, {user?.name}</span>
          <ChevronDown size={20} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute p-5 right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in-0 zoom-in-95">
            {/* Menu Items */}
            <UserMenuItems />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDropdown;