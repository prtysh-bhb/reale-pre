import { useState } from "react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { MailOpen, Search, Star, Trash2, Mail } from "lucide-react";

const InboxPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock data - replace with actual API call
  const messages = [
    {
      id: 1,
      from: "John Smith",
      subject: "Property Inquiry - Luxury Villa",
      preview: "I'm interested in scheduling a viewing for the luxury villa...",
      date: "2024-01-15 10:30 AM",
      read: false,
      starred: true
    },
    {
      id: 2,
      from: "Sarah Johnson",
      subject: "Question about Downtown Apartment",
      preview: "Could you provide more details about the parking facilities...",
      date: "2024-01-14 3:45 PM",
      read: true,
      starred: false
    },
    {
      id: 3,
      from: "Mike Wilson",
      subject: "Offer for Beach House",
      preview: "I would like to make an offer on the beach house property...",
      date: "2024-01-14 11:20 AM",
      read: false,
      starred: true
    },
    {
      id: 4,
      from: "Emily Brown",
      subject: "Request for Property Documents",
      preview: "Can you send me the complete documentation for...",
      date: "2024-01-13 2:15 PM",
      read: true,
      starred: false
    },
  ];

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" ||
                         (selectedFilter === "unread" && !m.read) ||
                         (selectedFilter === "starred" && m.starred);
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <MailOpen className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Inbox
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {messages.filter(m => !m.read).length} unread messages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-900 dark:text-white w-48 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedFilter === "all"
                ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-emerald-600"
            }`}
          >
            All Messages
          </button>
          <button
            onClick={() => setSelectedFilter("unread")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedFilter === "unread"
                ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-emerald-600"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setSelectedFilter("starred")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedFilter === "starred"
                ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-emerald-600"
            }`}
          >
            Starred
          </button>
        </div>

        {/* Messages List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group ${
                  !message.read ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {message.read ? (
                      <Mail className="text-gray-400" size={20} />
                    ) : (
                      <MailOpen className="text-blue-600 dark:text-emerald-400" size={20} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-semibold ${!message.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                        {message.from}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{message.date}</span>
                    </div>
                    <p className={`text-sm mb-1 ${!message.read ? "font-medium text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                      {message.subject}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {message.preview}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className={`p-2 rounded-lg transition-all ${message.starred ? "text-amber-500" : "text-gray-400 hover:text-amber-500"}`}>
                      <Star size={16} fill={message.starred ? "currentColor" : "none"} />
                    </button>
                    <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default InboxPage;
