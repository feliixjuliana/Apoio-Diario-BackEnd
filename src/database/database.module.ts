import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: (configService: ConfigService) => {
        return new Pool({
          user: configService.get<string>('database.user'),
          host: configService.get<string>('database.host'),
          database: configService.get<string>('database.name'),
          password: configService.get<string>('database.pass'),
          port: configService.get<number>('database.port'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}