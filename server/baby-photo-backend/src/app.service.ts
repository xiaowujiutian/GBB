import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🎉 欢迎使用乖宝宝儿童影楼管理系统！';
  }

  getHealth() {
    const currentTime = new Date().toISOString();
    const uptime = process.uptime();

    return {
      status: 'ok',
      message: '系统运行正常',
      timestamp: currentTime,
      uptime: `${Math.floor(uptime)}秒`,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected', // 这里可以添加真实的数据库连接检查
        redis: 'connected', // 这里可以添加真实的Redis连接检查
      },
    };
  }

  getVersion() {
    return {
      name: '乖宝宝儿童影楼管理系统',
      version: '1.0.0',
      description: '专业的婴儿摄影工作室管理解决方案',
      author: '开发团队',
      buildTime: new Date().toISOString(),
      features: ['用户管理', '套餐管理', '订单管理', '支付管理', '时间槽管理'],
      technologies: [
        'NestJS',
        'TypeScript',
        'Prisma',
        'PostgreSQL',
        'Redis',
        'Swagger',
      ],
    };
  }
}
