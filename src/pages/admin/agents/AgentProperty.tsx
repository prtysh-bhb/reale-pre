import { useState } from "react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { Building2, Search, Eye, Edit, Trash2, Grid3x3, List, HousePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AgentProperty = () => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Mock data - replace with actual API call
  const properties = [
    {
      id: 1,
      title: "Modern Luxury Villa",
      address: "123 Ocean Drive, Miami, FL",
      price: "$1,250,000",
      bedrooms: 4,
      bathrooms: 3,
      area: "3200 sq ft",
      status: "published",
      image: "https://placehold.co/400x300/3b82f6/ffffff?text=Property+1"
    },
    {
      id: 2,
      title: "Downtown Apartment",
      address: "456 Main St, New York, NY",
      price: "$850,000",
      bedrooms: 2,
      bathrooms: 2,
      area: "1200 sq ft",
      status: "pending_approval",
      image: "https://placehold.co/400x300/10b981/ffffff?text=Property+2"
    },
    {
      id: 3,
      title: "Suburban Family Home",
      address: "789 Maple Ave, Austin, TX",
      price: "$550,000",
      bedrooms: 3,
      bathrooms: 2.5,
      area: "2400 sq ft",
      status: "published",
      image: "https://placehold.co/400x300/8b5cf6/ffffff?text=Property+3"
    },
  ];

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending_approval":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  My Properties
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage your property listings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-900 dark:text-white w-48 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>

              <button
                onClick={() => navigate("/admin/agents/add-properties")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white transition-all text-sm shadow-md hover:shadow-lg font-medium"
              >
                <HousePlus size={16} />
                Add Property
              </button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(property.status)}`}>
                    {property.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{property.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{property.address}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                      {property.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>{property.bedrooms} Beds</span>
                    <span>{property.bathrooms} Baths</span>
                    <span>{property.area}</span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all text-sm">
                      <Eye size={16} />
                      View
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-all text-sm">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Property</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Location</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Price</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Details</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property, index) => (
                  <tr
                    key={property.id}
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group ${
                      index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/50"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900 dark:text-white">{property.title}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{property.address}</td>
                    <td className="py-4 px-6 font-bold text-blue-600 dark:text-emerald-400">{property.price}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {property.bedrooms} Beds · {property.bathrooms} Baths · {property.area}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(property.status)}`}>
                        {property.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-all">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AgentProperty;
