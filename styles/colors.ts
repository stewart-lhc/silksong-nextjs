/**
 * Hornet 色彩系统
 * 基于主色调 #C43444 设计的完整色彩系统
 */

// 主色板 - 基于 #C43444 (Hornet品牌色)
export const hornetPrimary = {
  50: '#FDF2F3',
  100: '#FCE5E7',
  200: '#F8CCD0',
  300: '#F2A6AD',
  400: '#E77A85',
  500: '#C43444', // 主色
  600: '#B02C3B',
  700: '#8E2430',
  800: '#72232C',
  900: '#5E1F26',
};

// 辅助色 - 蓝色
export const hornetBlue = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
};

// 辅助色 - 橙色
export const hornetOrange = {
  50: '#FFF7ED',
  100: '#FFEDD5',
  200: '#FED7AA',
  300: '#FDBA74',
  400: '#FB923C',
  500: '#F59E0B',
  600: '#EA580C',
  700: '#C2410C',
  800: '#9A3412',
  900: '#7C2D12',
};

// 辅助色 - 紫色
export const hornetPurple = {
  50: '#FAF5FF',
  100: '#F3E8FF',
  200: '#E9D5FF',
  300: '#D8B4FE',
  400: '#C084FC',
  500: '#A855F7',
  600: '#9333EA',
  700: '#7C3AED',
  800: '#6D28D9',
  900: '#581C87',
};

// 中性色
export const hornetNeutral = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
};

// 功能色 - 成功
export const hornetSuccess = {
  50: '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981',
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
};

// 功能色 - 警告
export const hornetWarning = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
};

// 功能色 - 错误
export const hornetError = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
};

// 功能色 - 信息
export const hornetInfo = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
};

// 完整色彩系统
export const hornetColors = {
  // 主色
  'primary-50': hornetPrimary[50],
  'primary-100': hornetPrimary[100],
  'primary-200': hornetPrimary[200],
  'primary-300': hornetPrimary[300],
  'primary-400': hornetPrimary[400],
  'primary-500': hornetPrimary[500],
  'primary-600': hornetPrimary[600],
  'primary-700': hornetPrimary[700],
  'primary-800': hornetPrimary[800],
  'primary-900': hornetPrimary[900],

  // 辅助色 - 蓝色
  'blue-50': hornetBlue[50],
  'blue-100': hornetBlue[100],
  'blue-500': hornetBlue[500],
  'blue-900': hornetBlue[900],

  // 辅助色 - 橙色
  'orange-50': hornetOrange[50],
  'orange-100': hornetOrange[100],
  'orange-500': hornetOrange[500],
  'orange-900': hornetOrange[900],

  // 辅助色 - 紫色
  'purple-50': hornetPurple[50],
  'purple-100': hornetPurple[100],
  'purple-500': hornetPurple[500],
  'purple-900': hornetPurple[900],

  // 中性色
  'neutral-50': hornetNeutral[50],
  'neutral-100': hornetNeutral[100],
  'neutral-200': hornetNeutral[200],
  'neutral-300': hornetNeutral[300],
  'neutral-400': hornetNeutral[400],
  'neutral-500': hornetNeutral[500],
  'neutral-600': hornetNeutral[600],
  'neutral-700': hornetNeutral[700],
  'neutral-800': hornetNeutral[800],
  'neutral-900': hornetNeutral[900],

  // 功能色
  'success-500': hornetSuccess[500],
  'warning-500': hornetWarning[500],
  'error-500': hornetError[500],
  'info-500': hornetInfo[500],

  // 基础色
  white: '#FFFFFF',
  black: '#000000',
};

export default hornetColors;
