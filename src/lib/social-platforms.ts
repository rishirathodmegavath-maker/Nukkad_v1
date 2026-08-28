import type { SocialPlatform } from '@/types'

export interface SocialPlatformMeta {
  value: SocialPlatform
  label: string
  placeholder: string
  badge: string
  badgeClass: string
}

/** Single source of truth for every supported social/profile link — consumed by EditProfileModal's link editor and PersonProfilePage's LinksCard. */
export const SOCIAL_PLATFORMS: SocialPlatformMeta[] = [
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/…', badge: 'in', badgeClass: 'bg-[#0A66C2] text-white' },
  { value: 'github', label: 'GitHub', placeholder: 'https://github.com/…', badge: '', badgeClass: 'bg-fg text-surface' },
  { value: 'portfolio', label: 'Portfolio', placeholder: 'https://…', badge: '', badgeClass: 'bg-brand-500 text-white' },
  { value: 'twitter', label: 'X', placeholder: 'https://x.com/…', badge: 'X', badgeClass: 'bg-black text-white' },
  { value: 'kaggle', label: 'Kaggle', placeholder: 'https://kaggle.com/…', badge: 'K', badgeClass: 'bg-[#20BEFF] text-white' },
  { value: 'leetcode', label: 'LeetCode', placeholder: 'https://leetcode.com/…', badge: 'L', badgeClass: 'bg-[#FFA116] text-white' },
  { value: 'behance', label: 'Behance', placeholder: 'https://behance.net/…', badge: 'Bē', badgeClass: 'bg-[#1769FF] text-white' },
  { value: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/…', badge: 'D', badgeClass: 'bg-[#EA4C89] text-white' },
  { value: 'medium', label: 'Medium', placeholder: 'https://medium.com/@…', badge: 'M', badgeClass: 'bg-fg text-surface' },
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…', badge: 'IG', badgeClass: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@…', badge: '▶', badgeClass: 'bg-[#FF0000] text-white' },
  { value: 'stackoverflow', label: 'Stack Overflow', placeholder: 'https://stackoverflow.com/users/…', badge: 'S', badgeClass: 'bg-[#F58025] text-white' },
  { value: 'devto', label: 'DEV', placeholder: 'https://dev.to/…', badge: 'dev', badgeClass: 'bg-fg text-surface' },
  { value: 'producthunt', label: 'Product Hunt', placeholder: 'https://producthunt.com/@…', badge: 'P', badgeClass: 'bg-[#DA552F] text-white' },
  { value: 'huggingface', label: 'Hugging Face', placeholder: 'https://huggingface.co/…', badge: '🤗', badgeClass: 'bg-[#FFD21E] text-black' },
]

export function socialPlatformMeta(platform: string): SocialPlatformMeta {
  return (
    SOCIAL_PLATFORMS.find((p) => p.value === platform) ?? {
      value: platform as SocialPlatform,
      label: platform,
      placeholder: 'https://…',
      badge: '',
      badgeClass: 'bg-surface-sunken text-fg',
    }
  )
}
