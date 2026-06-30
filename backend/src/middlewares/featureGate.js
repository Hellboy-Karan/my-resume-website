import { HttpError } from '../common/httpError.js';

export const defaultFeatureFlags = {
  canCreateResume: true,
  canEditOwnResume: true,
  canPublishResume: true,
  canDeleteOwnResume: true,
  canViewAllResumes: false,
  canModerateResumes: false,
  canManageTemplates: false,
  canEditResume: true,
  canDeleteResume: true,
  canSubmitResume: true,
  canUseATS: true,
  canUseAI: true,
  canUploadImage: true,
  canShareResume: true,
  canChangeTemplate: true
};

const roleDefaults = {
  ADMIN: {
    canCreateResume: true,
    canEditOwnResume: true,
    canPublishResume: true,
    canDeleteOwnResume: true,
    canViewAllResumes: true,
    canModerateResumes: true,
    canManageTemplates: true
  },
  SUB_ADMIN: {
    canCreateResume: true,
    canEditOwnResume: true,
    canPublishResume: true,
    canDeleteOwnResume: true,
    canViewAllResumes: true,
    canModerateResumes: true,
    canManageTemplates: false
  },
  USER: {
    canCreateResume: true,
    canEditOwnResume: true,
    canPublishResume: true,
    canDeleteOwnResume: true,
    canViewAllResumes: false,
    canModerateResumes: false,
    canManageTemplates: false
  }
};

const aliases = {
  canSubmitResume: 'canCreateResume',
  canEditResume: 'canEditOwnResume',
  canDeleteResume: 'canDeleteOwnResume'
};

export function resolvePermissions(user) {
  const role = user?.role || 'USER';
  const flags = user?.feature_flags || {};
  return {
    ...defaultFeatureFlags,
    ...(roleDefaults[role] || roleDefaults.USER),
    ...flags
  };
}

export function featureGate(flag) {
  return (req, _res, next) => {
    const flags = resolvePermissions(req.user);
    const effectiveFlag = aliases[flag] || flag;
    if (!flags[flag] || !flags[effectiveFlag]) {
      return next(new HttpError(403, `Feature disabled: ${flag}`));
    }
    return next();
  };
}
