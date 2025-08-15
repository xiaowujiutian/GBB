import { BaseEntity, Status } from './common';

export interface Package extends BaseEntity {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: number; // 服务时长（分钟）
  services: string[]; // 服务内容
  images: string[];
  status: Status;
  isPopular: boolean;
  orderCount: number;
  rating: number;
  tags: string[];
  category: string;
  maxBookings: number; // 最大预订数量
}

export interface PackageSearchParams {
  name?: string;
  status?: Status;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isPopular?: boolean;
}

export interface PackageFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: number;
  services: string[];
  images: string[];
  status: Status;
  isPopular: boolean;
  tags: string[];
  category: string;
  maxBookings: number;
}

export interface PackageStats {
  totalPackages: number;
  activePackages: number;
  popularPackages: number;
  avgPrice: number;
  totalBookings: number;
  topSellingPackage: {
    name: string;
    bookings: number;
  };
}
