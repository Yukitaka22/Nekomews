/**
 * Nekomews デザイントークン
 * ブランドガイドライン v0.1 に準拠
 */

export const Colors = {
  owner: {
    primary: '#F59E0B',
    primaryDark: '#D97706',
    accent: '#FB923C',
    bg: '#FFFBF5',
  },
  sitter: {
    primary: '#10B981',
    primaryDark: '#059669',
    accent: '#34D399',
    bg: '#F0FDF4',
  },
  neutral: {
    ink: '#1F2937',
    whisker: '#6B7280',
    fur: '#E5E7EB',
    snow: '#FFFFFF',
    cream: '#FFFBF5',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

export type Mode = 'owner' | 'sitter';

export function modeColors(mode: Mode) {
  return Colors[mode];
}
