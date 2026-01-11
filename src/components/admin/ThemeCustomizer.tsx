import { useState } from "react";
import {
  X,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  PanelLeft,
  PanelLeftClose,
  Pin,
  Layers,
  EyeOff,
  AlignLeft,
  AlignRight,
  Maximize2,
  Minimize2,
  Paintbrush,
  Check,
} from "lucide-react";
import {
  useTheme,
  PRIMARY_COLORS,
  PrimaryColorKey,
  ThemeMode,
  SkinType,
  NavbarType,
  ContentWidth,
  Direction,
  MenuState,
} from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export const ThemeCustomizer = ({ open, onClose }: ThemeCustomizerProps) => {
  const { settings, updateSettings, resetSettings } = useTheme();
  const [customColorInput, setCustomColorInput] = useState(settings.customColor);

  const handleCustomColorChange = (color: string) => {
    setCustomColorInput(color);
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      updateSettings({ primaryColor: "custom", customColor: color });
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[300px] bg-white dark:bg-gray-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Template Customizer
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customize and preview in real time
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetSettings}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Reset to defaults"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Theming Section */}
          <Section title="Theming">
            {/* Primary Color */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Primary Color
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PRIMARY_COLORS) as PrimaryColorKey[]).map((colorKey) => (
                  <button
                    key={colorKey}
                    onClick={() => updateSettings({ primaryColor: colorKey })}
                    className={cn(
                      "w-8 h-8 rounded-lg transition-all flex items-center justify-center",
                      settings.primaryColor === colorKey
                        ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 dark:ring-offset-gray-900"
                        : "hover:scale-110"
                    )}
                    style={{ backgroundColor: PRIMARY_COLORS[colorKey].value }}
                    title={PRIMARY_COLORS[colorKey].name}
                  >
                    {settings.primaryColor === colorKey && (
                      <Check size={14} className="text-white" />
                    )}
                  </button>
                ))}
                {/* Custom color picker */}
                <div className="relative">
                  <input
                    type="color"
                    value={customColorInput}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                  />
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all",
                      settings.primaryColor === "custom"
                        ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 dark:ring-offset-gray-900"
                        : "hover:border-gray-400 dark:hover:border-gray-500"
                    )}
                    style={
                      settings.primaryColor === "custom"
                        ? { backgroundColor: settings.customColor, borderStyle: "solid" }
                        : {}
                    }
                  >
                    {settings.primaryColor === "custom" ? (
                      <Check size={14} className="text-white" />
                    ) : (
                      <Paintbrush size={14} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Mode */}
            <div className="space-y-3 mt-5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                <ThemeModeButton
                  mode="light"
                  current={settings.mode}
                  icon={Sun}
                  label="Light"
                  onClick={() => updateSettings({ mode: "light" })}
                />
                <ThemeModeButton
                  mode="dark"
                  current={settings.mode}
                  icon={Moon}
                  label="Dark"
                  onClick={() => updateSettings({ mode: "dark" })}
                />
                <ThemeModeButton
                  mode="system"
                  current={settings.mode}
                  icon={Monitor}
                  label="System"
                  onClick={() => updateSettings({ mode: "system" })}
                />
              </div>
            </div>

            {/* Skin */}
            <div className="space-y-3 mt-5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Skins
              </label>
              <div className="grid grid-cols-2 gap-2">
                <SkinButton
                  skin="default"
                  current={settings.skin}
                  label="Default"
                  onClick={() => updateSettings({ skin: "default" })}
                />
                <SkinButton
                  skin="bordered"
                  current={settings.skin}
                  label="Bordered"
                  onClick={() => updateSettings({ skin: "bordered" })}
                />
              </div>
            </div>

            {/* Semi Dark */}
            <div className="flex items-center justify-between mt-5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Semi Dark
              </label>
              <ToggleSwitch
                checked={settings.semiDark}
                onChange={(checked) => updateSettings({ semiDark: checked })}
              />
            </div>
          </Section>

          {/* Layout Section */}
          <Section title="Layout">
            {/* Menu State */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Menu (Navigation)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <LayoutButton
                  value="expanded"
                  current={settings.menuState}
                  icon={PanelLeft}
                  label="Expanded"
                  onClick={() => updateSettings({ menuState: "expanded" })}
                />
                <LayoutButton
                  value="collapsed"
                  current={settings.menuState}
                  icon={PanelLeftClose}
                  label="Collapsed"
                  onClick={() => updateSettings({ menuState: "collapsed" })}
                />
              </div>
            </div>

            {/* Navbar Type */}
            <div className="space-y-3 mt-5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Navbar Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <LayoutButton
                  value="sticky"
                  current={settings.navbarType}
                  icon={Pin}
                  label="Sticky"
                  onClick={() => updateSettings({ navbarType: "sticky" })}
                />
                <LayoutButton
                  value="static"
                  current={settings.navbarType}
                  icon={Layers}
                  label="Static"
                  onClick={() => updateSettings({ navbarType: "static" })}
                />
                <LayoutButton
                  value="hidden"
                  current={settings.navbarType}
                  icon={EyeOff}
                  label="Hidden"
                  onClick={() => updateSettings({ navbarType: "hidden" })}
                />
              </div>
            </div>

            {/* Content Width */}
            <div className="space-y-3 mt-5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Content
              </label>
              <div className="grid grid-cols-2 gap-2">
                <LayoutButton
                  value="compact"
                  current={settings.contentWidth}
                  icon={Minimize2}
                  label="Compact"
                  onClick={() => updateSettings({ contentWidth: "compact" })}
                />
                <LayoutButton
                  value="wide"
                  current={settings.contentWidth}
                  icon={Maximize2}
                  label="Wide"
                  onClick={() => updateSettings({ contentWidth: "wide" })}
                />
              </div>
            </div>

            {/* Direction */}
            <div className="space-y-3 mt-5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <LayoutButton
                  value="ltr"
                  current={settings.direction}
                  icon={AlignLeft}
                  label="Left to Right (En)"
                  onClick={() => updateSettings({ direction: "ltr" })}
                />
                <LayoutButton
                  value="rtl"
                  current={settings.direction}
                  icon={AlignRight}
                  label="Right to Left (Ar)"
                  onClick={() => updateSettings({ direction: "rtl" })}
                />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
};

// Section Component
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <div className="inline-flex px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-semibold">
      {title}
    </div>
    {children}
  </div>
);

// Theme Mode Button
const ThemeModeButton = ({
  mode,
  current,
  icon: Icon,
  label,
  onClick,
}: {
  mode: ThemeMode;
  current: ThemeMode;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
      current === mode
        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
    )}
  >
    <Icon
      size={20}
      className={cn(
        current === mode
          ? "text-primary-600 dark:text-primary-400"
          : "text-gray-500 dark:text-gray-400"
      )}
    />
    <span
      className={cn(
        "text-xs font-medium",
        current === mode
          ? "text-primary-600 dark:text-primary-400"
          : "text-gray-600 dark:text-gray-400"
      )}
    >
      {label}
    </span>
  </button>
);

// Skin Button
const SkinButton = ({
  skin,
  current,
  label,
  onClick,
}: {
  skin: SkinType;
  current: SkinType;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
      current === skin
        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
    )}
  >
    <div
      className={cn(
        "w-12 h-8 rounded border-2 flex items-center",
        skin === "default"
          ? "border-transparent bg-gray-100 dark:bg-gray-700 shadow-sm"
          : "border-gray-300 dark:border-gray-500 bg-transparent"
      )}
    >
      <div
        className={cn(
          "w-3 h-full",
          skin === "default"
            ? "bg-gray-300 dark:bg-gray-500"
            : "border-r-2 border-gray-300 dark:border-gray-500"
        )}
      />
    </div>
    <span
      className={cn(
        "text-xs font-medium",
        current === skin
          ? "text-primary-600 dark:text-primary-400"
          : "text-gray-600 dark:text-gray-400"
      )}
    >
      {label}
    </span>
  </button>
);

// Layout Button
const LayoutButton = <T extends string>({
  value,
  current,
  icon: Icon,
  label,
  onClick,
}: {
  value: T;
  current: T;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
      current === value
        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
    )}
  >
    <div
      className={cn(
        "w-12 h-8 rounded border flex items-center overflow-hidden",
        current === value
          ? "border-primary-300 dark:border-primary-600"
          : "border-gray-200 dark:border-gray-600"
      )}
    >
      <div className="flex-1 h-full flex flex-col">
        <div
          className={cn(
            "h-2 w-full",
            current === value
              ? "bg-primary-200 dark:bg-primary-700"
              : "bg-gray-200 dark:bg-gray-600"
          )}
        />
        <div className="flex-1 flex">
          <div
            className={cn(
              "w-3 h-full",
              current === value
                ? "bg-primary-100 dark:bg-primary-800"
                : "bg-gray-100 dark:bg-gray-700"
            )}
          />
          <div className="flex-1" />
        </div>
      </div>
    </div>
    <span
      className={cn(
        "text-xs font-medium text-center leading-tight",
        current === value
          ? "text-primary-600 dark:text-primary-400"
          : "text-gray-600 dark:text-gray-400"
      )}
    >
      {label}
    </span>
  </button>
);

// Toggle Switch
const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
      checked ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
    )}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
        checked ? "translate-x-6" : "translate-x-1"
      )}
    />
  </button>
);

export default ThemeCustomizer;
