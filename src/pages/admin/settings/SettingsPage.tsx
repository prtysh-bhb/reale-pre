/* eslint-disable no-case-declarations */
// src/pages/admin/settings/SettingsPage.tsx
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Save, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AppSetting,
  GroupedAppSettings,
  getAppSettings,
  bulkUpdateAppSettings,
} from "@/api/admin/appsetting";
import { BulkUpdateSettingItem } from "@/api/admin/appsetting";

const SettingsPage = () => {
  const [settings, setSettings] = useState<GroupedAppSettings>({});
  const [changedSettings, setChangedSettings] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getAppSettings();
      
      if (response.success) {
        const data = response.data as GroupedAppSettings;
        setSettings(data);
        
        // Set first group as active if none selected
        if (!activeGroup && Object.keys(data).length > 0) {
          setActiveGroup(Object.keys(data)[0]);
        }
        
        setChangedSettings({});
      } else {
        toast.error(response.message || "Failed to load settings");
      }
    } catch (error) {
      toast.error("Failed to load settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle setting change
  const handleSettingChange = (id: number, value: string) => {
    setChangedSettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Save all changes
  const handleSaveAll = async () => {
    if (Object.keys(changedSettings).length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      setSaving(true);
      
      const settingsToUpdate: BulkUpdateSettingItem[] = Object.entries(changedSettings).map(([id, value]) => ({
        id: parseInt(id),
        value
      }));

      const response = await bulkUpdateAppSettings({ settings: settingsToUpdate });
      
      if (response.success) {
        toast.success("Settings saved successfully");
        setChangedSettings({});
        loadSettings(); // Reload to get fresh data
      } else {
        toast.error(response.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Format group name for display
  const formatGroupName = (name: string) => {
    return name
      .split(/[_-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get all groups
  const groups = Object.keys(settings || {});
  
  // Get current group settings
  const currentGroupSettings = activeGroup ? settings[activeGroup] : [];

  // Get changed count for current group
  const currentGroupChangedCount = currentGroupSettings?.filter(
    setting => changedSettings[setting.id]
  ).length || 0;

  // Total changed count
  const totalChangedCount = Object.keys(changedSettings).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <Settings className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Application Settings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage all application configuration settings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={loadSettings}
                variant="outline"
                size="sm"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={saving || totalChangedCount === 0}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes ({totalChangedCount})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Navigation - Groups */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 sticky top-6">
              <CardContent className="p-4">
                {/* Changed Settings Indicator */}
                {totalChangedCount > 0 && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                          {totalChangedCount} unsaved change{totalChangedCount !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Click "Save Changes" to apply
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <nav className="space-y-1">
                  {groups.map((group) => {
                    const groupChangedCount = settings[group]?.filter(
                      setting => changedSettings[setting.id]
                    ).length || 0;
                    
                    return (
                      <button
                        key={group}
                        onClick={() => setActiveGroup(group)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                          activeGroup === group
                            ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md ${activeGroup === group ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <Settings className={`w-4 h-4 ${activeGroup === group ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                          </div>
                          <span className="font-medium">{formatGroupName(group)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {groupChangedCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/20">
                              {groupChangedCount}
                            </span>
                          )}
                          <span className="text-xs opacity-70">
                            {settings[group]?.length || 0}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              // Loading State
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading settings...</p>
                  </div>
                </CardContent>
              </Card>
            ) : !activeGroup ? (
              // No Group Selected
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <Settings className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Select a Settings Group
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Choose a group from the sidebar to view and manage settings
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : currentGroupSettings?.length === 0 ? (
              // No Settings in Group
              <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                      <Settings className="text-gray-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Settings Found
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No settings found in {formatGroupName(activeGroup)} group
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Settings Form
              <>
                {/* Group Header */}
                <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {formatGroupName(activeGroup)}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {currentGroupSettings.length} setting{currentGroupSettings.length !== 1 ? 's' : ''}
                          {currentGroupChangedCount > 0 && (
                            <span className="ml-2 text-amber-600 dark:text-amber-400">
                              • {currentGroupChangedCount} changed
                            </span>
                          )}
                        </p>
                      </div>
                      {currentGroupChangedCount > 0 && (
                        <Button
                          onClick={handleSaveAll}
                          size="sm"
                          disabled={saving}
                          className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                        >
                          {saving ? (
                            <>
                              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3 mr-2" />
                              Save This Group
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentGroupSettings.map((setting) => (
                    <Card 
                      key={setting.id}
                      className={`bg-white dark:bg-gray-900 border ${
                        changedSettings[setting.id] 
                          ? "border-amber-300 dark:border-amber-700" 
                          : "border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <label className="text-sm font-medium text-gray-900 dark:text-white">
                                {setting.label}
                              </label>
                              {changedSettings[setting.id] && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                  Changed
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Setting Input */}
                          <div>
                            {renderSettingInput(setting, changedSettings[setting.id] || setting.value, (value) => 
                              handleSettingChange(setting.id, value)
                            )}
                          </div>

                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Helper function to render different input types
const renderSettingInput = (
  setting: AppSetting,
  value: string,
  onChange: (value: string) => void
) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  switch (setting.datatype) {
    case "boolean":
      const boolValue = value === "true" || value === "1";
      return (
        <button
          type="button"
          onClick={() => onChange(boolValue ? "false" : "true")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            boolValue ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              boolValue ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      );

    case "number":
      return (
        <input
          type="number"
          value={value}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );

    case "json":
      return (
        <textarea
          value={value}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      );

    default: // string
      // Check if it's a password field
      const isPassword = setting.name.toLowerCase().includes("password") || 
                         setting.name.toLowerCase().includes("secret") ||
                         setting.name.toLowerCase().includes("key") ||
                         setting.name.toLowerCase().includes("token");
      
      return (
        <input
          type={isPassword ? "password" : "text"}
          value={value}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
  }
};

export default SettingsPage;