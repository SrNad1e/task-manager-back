import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGODB_URI');
        if (!mongoUri) {
          throw new Error('MONGODB_URI is not defined');
        }
        return {
          uri: mongoUri,
        };
      },
    }),
    UsersModule,
    AuthModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
