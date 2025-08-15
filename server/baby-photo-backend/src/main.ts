import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    // 启用 CORS
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:8080',
        'https://your-domain.com',
      ],
      credentials: true,
    });

    // 全局验证管道
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false,
      }),
    );

    // API 版本前缀
    app.setGlobalPrefix('api/v1');

    // Swagger 文档配置
    const config = new DocumentBuilder()
      .setTitle('乖宝宝儿童影楼管理系统 API')
      .setDescription('婴儿摄影工作室管理系统的后端 API 文档')
      .setVersion('1.0.0')
      .addTag('users', '用户管理')
      .addTag('packages', '套餐管理')
      .addTag('orders', '订单管理')
      .addTag('payments', '支付管理')
      .addTag('time-slots', '时间槽管理')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 乖宝宝儿童影楼管理系统启动成功!`);
    logger.log(`🌐 服务地址: http://localhost:${port}`);
    logger.log(`📚 API 文档: http://localhost:${port}/api/docs`);
    logger.log(`🏥 健康检查: http://localhost:${port}/api/v1/health`);
  } catch (error) {
    logger.error('启动应用失败:', error);
    process.exit(1);
  }
}

// 启动应用
void bootstrap();
