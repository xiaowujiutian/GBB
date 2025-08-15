import { request } from './api';
import { User, UserStats, UserSearchParams } from '@/types/user';
import { PaginatedResponse, PaginationParams } from '@/types/common';

export const userService = {
  // 获取用户列表
  getUsers: (params: PaginationParams): Promise<{ data: PaginatedResponse<User> }> => {
    // Mock data for development
    return Promise.resolve({
      data: {
        list: [] as User[],
        pagination: {
          current: params.page,
          pageSize: params.pageSize,
          total: 0,
        },
      },
    });
  },

  // 获取用户详情
  getUserById: (_id: string): Promise<{ data: User }> => {
    // Mock data for development
    return Promise.resolve({
      data: {} as User,
    });
  },

  // 获取用户统计
  getUserStats: (): Promise<{ data: UserStats }> => {
    // Mock data for development
    return Promise.resolve({
      data: {
        totalUsers: 1250,
        activeUsers: 980,
        newUsersToday: 15,
        vipUsers: 320,
        growthRate: 12.5,
      },
    });
  },

  // 创建用户 (实际项目中实现)
  createUser: async (data: Partial<User>): Promise<{ data: User }> => {
    const response = await request.post<User>('/users', data);
    return { data: response.data.data };
  },

  // 更新用户 (实际项目中实现)
  updateUser: async (id: string, data: Partial<User>): Promise<{ data: User }> => {
    const response = await request.put<User>(`/users/${id}`, data);
    return { data: response.data.data };
  },

  // 删除用户 (实际项目中实现)
  deleteUser: async (id: string): Promise<{ data: boolean }> => {
    const response = await request.delete<boolean>(`/users/${id}`);
    return { data: response.data.data };
  },

  // 批量删除用户 (实际项目中实现)
  batchDeleteUsers: async (ids: string[]): Promise<{ data: boolean }> => {
    const response = await request.post<boolean>('/users/batch-delete', { ids });
    return { data: response.data.data };
  },

  // 导出用户数据
  exportUsers: async (params: UserSearchParams): Promise<void> => {
    try {
      const response = await request.get('/users/export', { 
        params, 
        responseType: 'blob' as any 
      });
      
      // 创建下载链接
      const blob = new Blob([response.data.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },
};
