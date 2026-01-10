import { NotificationItem } from "@/api/public/notifications";
import { Bell, CheckCheck, X, MessageSquare, Calendar, CreditCard, Home, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

interface NotificationsComponentProps {
  notifications: NotificationItem[];
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: number) => void;
  unreadCount: number;
  customClass?: string;
}

const Notifications: React.FC<NotificationsComponentProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  unreadCount,
  customClass
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'inquiry_received':
        return <MessageSquare className="w-4 h-4" />;
      case 'appointment_scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'payment_success':
        return <CreditCard className="w-4 h-4" />;
      case 'property_approved':
        return <Home className="w-4 h-4" />;
      case 'property_rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'inquiry_received':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'appointment_scheduled':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'payment_success':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'property_approved':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'property_rejected':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderNotificationContent = (notification: NotificationItem) => {
    const { type, data } = notification;

    switch (type) {
      case 'inquiry_received':
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              New Inquiry: {data.property_title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              From: {data.customer_name} • {data.customer_phone}
            </p>
            {data.inquiry_message && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                "{data.inquiry_message}"
              </p>
            )}
          </div>
        );

      case 'appointment_scheduled':
        return (
          <div className="space-y-1">
            <p className="text-sm capitalize font-medium text-gray-900 dark:text-white">
              {data.appointment_type} Scheduled
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              With: {data.customer_name} • {data.scheduled_at}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Property: {data.property_title}
            </p>
          </div>
        );

      case 'payment_success':
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Payment Successful
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data.plan_name} • ${data.amount}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              User: {data.user_name}
            </p>
          </div>
        );

      case 'property_approved':
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Property Approved
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data.property_title}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Approved on: {data.approved_at}
            </p>
          </div>
        );

      case 'property_rejected':
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Property Rejected
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data.property_title}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Reason: {data.reason}
            </p>
          </div>
        );

      default:
        return (
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {data.message}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 cursor-pointer rounded-lg dark:hover:bg-blue-950/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 ${customClass} transition-colors`}
        aria-expanded={isOpen}
        aria-label={`Open notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
                </p>
              </div>
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  onClick={() => {
                    onMarkAllAsRead();
                    setIsOpen(false);
                  }}
                  className="text-xs cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  <CheckCheck size={12} />
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${
                    !notification.read_at ? "bg-gray-50 dark:bg-gray-800/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Notification Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={notification.data.action_url}
                        onClick={() => {
                          if (onMarkAsRead && !notification.read_at) {
                            onMarkAsRead(Number(notification.id));
                          }
                          setIsOpen(false);
                        }}
                        className="block hover:no-underline"
                      >
                        {renderNotificationContent(notification)}
                      </Link>
                      
                      {/* Additional Actions */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {notification.read_at && <CheckCheck className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(Number(notification.id));
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete notification"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Total: {notifications.length}</span>
              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
              <span>Unread: {unreadCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;