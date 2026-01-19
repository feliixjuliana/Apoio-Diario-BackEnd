import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { ChildrenModule } from './children/children.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoutinesModule } from './routines/routines.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    ChildrenModule,
    RoutinesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
