import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { ChildrenModule } from './children/children.module';
import { PrismaModule } from 'prisma/prisma.module';
import { SubtasksModule } from './subtasks/subtasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    PrismaModule,
    SubtasksModule,
    UsersModule,
    ChildrenModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
