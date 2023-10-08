import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { BonusModule } from './bonus/bonus.module';

@Module({
  imports: [
    BonusModule,
    TypeOrmModule.forRoot({
      host: `${process.env.DB_HOST}`,
      port: parseInt(process.env.DB_PORT, 10),
      username: `${process.env.DB_USERNAME}`,
      password: `${process.env.DB_PASSWORD}`,
      database: `${process.env.DB_DATABASE}`,
      type: 'postgres',
      synchronize: true,
      logging: true,
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
