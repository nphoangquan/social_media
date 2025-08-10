export const USER_ROLES = ["user", "moderator", "admin"] as const;
export type UserRole = typeof USER_ROLES[number];


