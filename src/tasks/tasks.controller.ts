import { Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Get } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';

@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) { }

    @Get()
    findAll() {
        return this.tasksService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Post()
    create(@Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.create(createTaskDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tasksService.delete(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.update(id, updateTaskDto);
    }
}
