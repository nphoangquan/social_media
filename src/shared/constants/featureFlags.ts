export type FeatureFlagKey =
  | "enableAiCaption"
  | "enableSocketNotifications"
  | "enableStoryVideoUpload";

// Default flags; can be overridden via environment or remote config later
export const featureFlags: Record<FeatureFlagKey, boolean> = {
  enableAiCaption: true,
  enableSocketNotifications: true,
  enableStoryVideoUpload: true,
};

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return featureFlags[flag];
}


