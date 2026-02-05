import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from './tasks/tasks.module';

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined');
}

@Module({
  imports: [TasksModule, MongooseModule.forRoot(mongoUri)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
