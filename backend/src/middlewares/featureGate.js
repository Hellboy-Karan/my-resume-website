import { HttpError } from '../common/httpError.js';

export const defaultFeatureFlags = {
  canEditResume: true,
  canDeleteResume: true,
  canSubmitResume: true,
  canUseATS: true,
  canUseAI: true,
  canUploadImage: true,
  canShareResume: true,
  canChangeTemplate: true
};

export function featureGate(flag) {
  return (req, _res, next) => {
    const flags = { ...defaultFeatureFlags, ...(req.user.feature_flags || {}) };
    if (!flags[flag]) {
      return next(new HttpError(403, `Feature disabled: ${flag}`));
    }
    return next();
  };
}

