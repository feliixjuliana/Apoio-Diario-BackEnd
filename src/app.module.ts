import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ChildrenModule } from './children/children.module';
import configuration from './config/configuration';
import { RecurrenceRulesModule } from './recurrence-routines/recurrence-rules.module';
import { RoutinesModule } from './routines/routines.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    RecurrenceRulesModule,
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
