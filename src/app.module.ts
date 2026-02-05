import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TasksModule, MongooseModule.forRoot('mongodb+srv://mrnobody:1gOh7xGBd8521r4w@taskmanagerdb.dmew8pv.mongodb.net/')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
