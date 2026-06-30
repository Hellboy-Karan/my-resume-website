export type UserRole = 'ADMIN' | 'SUB_ADMIN' | 'USER';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface Permissions {
  canCreateResume: boolean;
  canEditOwnResume: boolean;
  canPublishResume: boolean;
  canDeleteOwnResume: boolean;
  canViewAllResumes: boolean;
  canModerateResumes: boolean;
  canManageTemplates: boolean;
  canEditResume?: boolean;
  canDeleteResume?: boolean;
  canSubmitResume?: boolean;
  canUseATS?: boolean;
  canUseAI?: boolean;
  canUploadImage?: boolean;
  canShareResume?: boolean;
  canChangeTemplate?: boolean;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  feature_flags?: Partial<Permissions>;
  profile_image_url?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  about_me?: string | null;
  short_description?: string | null;
  profile_title?: string | null;
  theme_preference?: ThemePreference;
  professional_info?: Record<string, string>;
  certificates?: Certificate[];
  social_links?: SocialLink[];
}

export interface ResumeOwner {
  name: string;
  username: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  profileImageUrl?: string;
  shortDescription?: string;
  title?: string;
  socialLinks?: SocialLink[];
}

export interface Resume {
  id: number | string;
  user_id: number;
  title: string;
  slug: string;
  template_slug: string;
  profile_image_url?: string | null;
  view_count: number;
  is_public: boolean;
  watermark_enabled: boolean;
  owner?: ResumeOwner;
  created_at: string;
  updated_at: string;
}

export interface ResumeSection {
  id: number | string;
  resume_id: number;
  type: string;
  title: string;
  content: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
}

export interface Template {
  slug: string;
  name: string;
  description: string;
  image?: string;
  image_url?: string;
}

export interface Certificate {
  name: string;
  organization?: string;
  link?: string;
  image?: string;
  description?: string;
}

export interface AnalyzerResult {
  score: number;
  scoreLabel: string;
  issues: string[];
  missingSkills: string[];
  missingKeywords: string[];
  matchingSkills: string[];
  formattingProblems: string[];
  grammarIssues: string[];
  suggestions: string[];
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ResumeResponse {
  resume: Resume;
  sections: ResumeSection[];
}
