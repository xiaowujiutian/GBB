import { BaseEntity, Status } from './common';

export interface User extends BaseEntity {
  phone: string;
  nickname?: string;
  wechatId?: string;
  avatar?: string;
  status: Status;
  lastLoginAt?: string;
  orderCount: number;
  totalAmount: number;
  isVip: boolean;
  vipLevel?: number;
  tags?: string[];
}

export interface UserSearchParams {
  phone?: string;
  nickname?: string;
  wechatId?: string;
  status?: Status;
  isVip?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UserFormData {
  phone: string;
  nickname?: string;
  wechatId?: string;
  avatar?: string;
  status: Status;
  isVip: boolean;
  vipLevel?: number;
  tags?: string[];
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  vipUsers: number;
  growthRate: number;
}
