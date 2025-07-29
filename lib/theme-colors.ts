export const THEME_COLORS = [
  {
    name: "Blue",
    value: "blue",
    primary: "bg-blue-600",
    hover: "hover:bg-blue-700",
    border: "border-blue-500/50",
    ring: "focus:ring-blue-500/50",
    text: "text-blue-600"
  },
  {
    name: "Purple",
    value: "purple",
    primary: "bg-purple-600",
    hover: "hover:bg-purple-700",
    border: "border-purple-500/50",
    ring: "focus:ring-purple-500/50",
    text: "text-purple-600"
  },
  {
    name: "Green",
    value: "green",
    primary: "bg-green-600",
    hover: "hover:bg-green-700",
    border: "border-green-500/50",
    ring: "focus:ring-green-500/50",
    text: "text-green-600"
  },
  {
    name: "Red",
    value: "red",
    primary: "bg-red-600",
    hover: "hover:bg-red-700",
    border: "border-red-500/50",
    ring: "focus:ring-red-500/50",
    text: "text-red-600"
  },
  {
    name: "Orange",
    value: "orange",
    primary: "bg-orange-600",
    hover: "hover:bg-orange-700",
    border: "border-orange-500/50",
    ring: "focus:ring-orange-500/50",
    text: "text-orange-600"
  },
  {
    name: "Pink",
    value: "pink",
    primary: "bg-pink-600",
    hover: "hover:bg-pink-700",
    border: "border-pink-500/50",
    ring: "focus:ring-pink-500/50",
    text: "text-pink-600"
  },
  {
    name: "Indigo",
    value: "indigo",
    primary: "bg-indigo-600",
    hover: "hover:bg-indigo-700",
    border: "border-indigo-500/50",
    ring: "focus:ring-indigo-500/50",
    text: "text-indigo-600"
  },
  {
    name: "Teal",
    value: "teal",
    primary: "bg-teal-600",
    hover: "hover:bg-teal-700",
    border: "border-teal-500/50",
    ring: "focus:ring-teal-500/50",
    text: "text-teal-600"
  }
] as const;

export type ThemeColor = typeof THEME_COLORS[number]['value'];

export const getThemeColor = (color: ThemeColor) => {
  return THEME_COLORS.find(c => c.value === color) || THEME_COLORS[0];
};

export const DEFAULT_THEME_COLOR: ThemeColor = "blue";