import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { ChildrenModule } from './children/children.module';
import { RoutinesModule } from './routines/routines.module';
import { SubtasksModule } from './subtasks/subtasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    
    UsersModule,
    ChildrenModule,
    RoutinesModule,
    SubtasksModule,
  ],
  controllers: [AppController],
})
export class AppModule {}