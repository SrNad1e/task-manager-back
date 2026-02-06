import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from './tasks/tasks.module';

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
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
