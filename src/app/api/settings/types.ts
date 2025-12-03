// app/api/settings/types.ts
// Type definitions for Settings API

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

export interface RechargeAmount {
  id: number;
  amount: number;
  cashback: number | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface HoroscopeSign {
  id: string;
  name: string;
  displayOrder: number | null;
  image: string;
  isActive: boolean;
  isDelete: boolean;
  created_at: Date | null;
  updated_at: Date | null;
  createdBy: number;
  modifiedBy: number;
}

export interface DefaultProfile {
  id: number;
  name: string;
  profile: string;
  isActive: boolean;
  isDelete: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Banner {
  id: string;
  bannerImage: string | null;
  fromDate: Date;
  toDate: Date;
  bannerTypeId: string;
  isActive: boolean;
  isDelete: boolean;
  created_at: Date | null;
  updated_at: Date | null;
  createdBy: number;
  modifiedBy: number;
  bannerType?: BannerType;
}

export interface BannerType {
  id: string;
  name: string;
  appId: string;
  isActive: boolean;
  isDelete: boolean;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface Gift {
  id: string;
  name: string;
  image: string | null;
  amount: number;
  displayOrder: number | null;
  isActive: boolean;
  isDelete: boolean;
  created_at: Date | null;
  updated_at: Date | null;
  createdBy: number;
  modifiedBy: number;
}

export interface Language {
  id: string;
  languageName: string;
  created_at: Date | null;
  updated_at: Date | null;
  languageCode: string | null;
  language_sign: string | null;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  isDelete: boolean;
  created_at: Date | null;
  updated_at: Date | null;
  createdBy: number;
  modifiedBy: number;
}

export interface SystemFlag {
  id: number;
  valueType: string | null;
  name: string | null;
  value: string | null;
  isActive: string | null;
  isDelete: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  displayName: string | null;
  flagGroupId: number;
  description: string;
  parent_id: number;
  viewenable: boolean | null;
  flagGroup?: FlagGroup;
}

export interface FlagGroup {
  id: number;
  flagGroupName: string | null;
  parentFlagGroupId: number | null;
  displayOrder: number | null;
  isActive: number | null;
  isDelete: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  description: string;
  viewenable: boolean | null;
}

// Request body types
export interface CreateRechargeRequest {
  amount: number;
  cashback?: number;
}

export interface UpdateRechargeRequest {
  amount?: number;
  cashback?: number;
}

export interface CreateHoroscopeSignRequest {
  name: string;
  image: string;
  displayOrder?: number;
  isActive?: boolean;
  createdBy: number;
  modifiedBy: number;
}

export interface UpdateHoroscopeSignRequest {
  name?: string;
  image?: string;
  displayOrder?: number;
  isActive?: boolean;
  modifiedBy: number;
}

export interface CreateDefaultProfileRequest {
  name: string;
  profile: string;
  isActive?: boolean;
}

export interface UpdateDefaultProfileRequest {
  name?: string;
  profile?: string;
  isActive?: boolean;
}

export interface CreateBannerRequest {
  bannerImage: string;
  fromDate: string;
  toDate: string;
  bannerTypeId: string;
  isActive?: boolean;
  createdBy: number;
  modifiedBy: number;
}

export interface UpdateBannerRequest {
  bannerImage?: string;
  fromDate?: string;
  toDate?: string;
  bannerTypeId?: string;
  isActive?: boolean;
  modifiedBy: number;
}

export interface CreateGiftRequest {
  name: string;
  image?: string;
  amount: number;
  displayOrder?: number;
  isActive?: boolean;
  createdBy: number;
  modifiedBy: number;
}

export interface UpdateGiftRequest {
  name?: string;
  image?: string;
  amount?: number;
  displayOrder?: number;
  isActive?: boolean;
  modifiedBy: number;
}

export interface CreateLanguageRequest {
  languageName: string;
  languageCode: string;
  language_sign?: string;
}

export interface UpdateLanguageRequest {
  languageName?: string;
  languageCode?: string;
  language_sign?: string;
}

export interface CreateNotificationRequest {
  title: string;
  description: string;
  isActive?: boolean;
  createdBy: number;
  modifiedBy: number;
}

export interface UpdateNotificationRequest {
  title?: string;
  description?: string;
  isActive?: boolean;
  modifiedBy: number;
}

export interface CreateSystemFlagRequest {
  name: string;
  displayName?: string;
  value?: string;
  valueType?: string;
  flagGroupId: number;
  description?: string;
  isActive?: boolean;
  viewenable?: boolean;
  parent_id?: number;
}

export interface UpdateSystemFlagRequest {
  name?: string;
  displayName?: string;
  value?: string;
  valueType?: string;
  flagGroupId?: number;
  description?: string;
  isActive?: boolean;
  viewenable?: boolean;
  parent_id?: number;
}

export interface BulkUpdateFlagRequest {
  id: number;
  value?: string;
  isActive?: boolean;
  displayName?: string;
  description?: string;
}

export interface BulkUpdateRequest {
  updates: BulkUpdateFlagRequest[];
}

export interface BulkCreateFlagRequest {
  name: string;
  displayName?: string;
  value?: string;
  valueType?: string;
  flagGroupId: number;
  description?: string;
}

export interface BulkCreateRequest {
  flags: BulkCreateFlagRequest[];
}

export interface CreateFlagGroupRequest {
  flagGroupName: string;
  description?: string;
  displayOrder?: number;
  parentFlagGroupId?: number;
  isActive?: boolean;
  viewenable?: boolean;
}

// Query parameter types
export interface GetFlagsQueryParams {
  flagGroupId?: string;
  activeOnly?: boolean;
  search?: string;
}

export interface GetBannersQueryParams {
  activeOnly?: boolean;
  bannerTypeId?: string;
  current?: boolean;
}

export interface GetFlagGroupsQueryParams {
  activeOnly?: boolean;
  withFlags?: boolean;
}

// Overview/Statistics types
export interface SettingsStatistics {
  recharge: {
    total: number;
    label: string;
    icon: string;
  };
  horoscopeSigns: {
    total: number;
    label: string;
    icon: string;
  };
  defaultProfiles: {
    total: number;
    label: string;
    icon: string;
  };
  banners: {
    total: number;
    active: number;
    label: string;
    icon: string;
  };
  gifts: {
    total: number;
    label: string;
    icon: string;
  };
  languages: {
    total: number;
    label: string;
    icon: string;
  };
  notifications: {
    total: number;
    label: string;
    icon: string;
  };
  systemFlags: {
    total: number;
    groups: number;
    label: string;
    icon: string;
  };
}

export interface RecentActivity {
  type: 'recharge' | 'banner' | 'flag';
  id: string | number;
  label: string;
  group?: string;
  updated_at: Date | null;
}

export interface SettingsOverview {
  statistics: SettingsStatistics;
  recentActivity: {
    recharges: RecentActivity[];
    banners: RecentActivity[];
    flags: RecentActivity[];
  };
  flagGroups: Array<{
    id: number;
    name: string | null;
    description: string;
    flagCount: number;
  }>;
  criticalSettings: Array<{
    id: number;
    name: string | null;
    displayName: string | null;
    value: string | null;
    isActive: boolean;
    group: string | null | undefined;
  }>;
}