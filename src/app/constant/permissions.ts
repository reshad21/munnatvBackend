/**
 * ONE permission vocabulary used everywhere (backend + frontend mirror).
 * Feature keys are the canonical identifiers stored in the DB
 * (RoleFeature.path and RolePermission.feature).
 */

export const PERMISSION_ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'status',
  'export',
  'assign',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export interface FeatureDefinition {
  key: string;
  label: string;
  actions: PermissionAction[];
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  { key: 'auth', label: 'Auth', actions: ['view'] },
  {
    key: 'roles_permissions',
    label: 'Roles & Permissions',
    actions: ['view', 'create', 'edit', 'delete', 'status', 'export', 'assign'],
  },
  {
    key: 'blogs',
    label: 'Blogs',
    actions: ['view', 'create', 'edit', 'delete', 'status', 'export'],
  },
  { key: 'faqs', label: 'FAQs', actions: ['view', 'create', 'edit', 'delete'] },
  {
    key: 'fivePillarsOfIslam',
    label: 'Five Pillar',
    actions: ['view', 'create', 'edit', 'delete', 'status'],
  },
  { key: 'contacts', label: 'Contacts', actions: ['view', 'delete', 'export'] },
  {
    key: 'services',
    label: 'Services',
    actions: ['view', 'create', 'edit', 'delete', 'status'],
  },
  { key: 'update-profile', label: 'Update Profile', actions: ['view', 'edit'] },
  {
    key: 'page-setting',
    label: 'Page Settings',
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    key: 'page-setting/hero-area',
    label: 'Hero Area',
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    key: 'page-setting/about-us',
    label: 'About Us',
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    key: 'page-setting/contact-us',
    label: 'Contact Us',
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    key: 'packages',
    label: 'Packages',
    actions: ['view', 'create', 'edit', 'delete', 'status', 'export'],
  },
  {
    key: 'gallery',
    label: 'Gallery',
    actions: ['view', 'create', 'edit', 'delete', 'status'],
  },
  {
    key: 'reviews',
    label: 'Reviews',
    actions: ['view', 'create', 'edit', 'delete', 'status', 'export'],
  },
  {
    key: 'video-gallery',
    label: 'Video Gallery',
    actions: ['view', 'create', 'edit', 'delete', 'status'],
  },
];

export const FEATURE_KEYS = FEATURE_DEFINITIONS.map((f) => f.key);

export const SUPPORTED_ACTIONS: Record<string, PermissionAction[]> =
  Object.fromEntries(
    FEATURE_DEFINITIONS.map((f) => [f.key, f.actions]),
  ) as Record<string, PermissionAction[]>;

/** Legacy dashboard-style paths mapped to canonical keys. */
export const LEGACY_FEATURE_PATH_MAP: Record<string, string> = {
  roles: 'roles_permissions',
  settings: 'page-setting',
  fivepillars: 'fivePillarsOfIslam',
  fivepillar: 'fivePillarsOfIslam',
};

export const canonicalFeatureKey = (raw: string): string => {
  const normalized = (raw ?? '').replace(/^\/+|\/+$/g, '');
  const lower = normalized.toLowerCase();
  if (LEGACY_FEATURE_PATH_MAP[lower]) return LEGACY_FEATURE_PATH_MAP[lower];
  const exact = FEATURE_KEYS.find((k) => k.toLowerCase() === lower);
  return exact ?? normalized;
};

export const isKnownFeature = (key: string): boolean =>
  FEATURE_KEYS.includes(key);

export const isSupportedAction = (
  feature: string,
  action: string,
): boolean => {
  const actions = SUPPORTED_ACTIONS[feature];
  return !!actions && (actions as string[]).includes(action);
};

/** Route-guard helper: require `action` on `feature`. */
export const can = (feature: string, action: PermissionAction) => ({
  feature,
  action,
});

export type PermissionsMap = Record<string, PermissionAction[]>;

/** Build { feature: [actions] } from stored permission rows. */
export const buildPermissionsMap = (
  rows: { feature: string; action: string }[],
): PermissionsMap => {
  const map: PermissionsMap = {};
  for (const row of rows) {
    const feature = canonicalFeatureKey(row.feature);
    if (!isKnownFeature(feature)) continue;
    if (!isSupportedAction(feature, row.action)) continue;
    if (!map[feature]) map[feature] = [];
    if (!map[feature].includes(row.action as PermissionAction)) {
      map[feature].push(row.action as PermissionAction);
    }
  }
  return map;
};

/**
 * Legacy fallback: a role with no granular rows keeps working —
 * every stored feature grants all of its supported actions.
 */
export const permissionsMapFromLegacyFeatures = (
  features: { path: string }[],
): PermissionsMap => {
  const map: PermissionsMap = {};
  for (const feature of features) {
    const key = canonicalFeatureKey(feature.path);
    if (!isKnownFeature(key)) continue;
    map[key] = [...SUPPORTED_ACTIONS[key]];
  }
  return map;
};

export const hasPermission = (
  map: PermissionsMap | undefined | null,
  feature: string,
  action: PermissionAction,
): boolean => {
  if (!map) return false;
  return !!map[canonicalFeatureKey(feature)]?.includes(action);
};
