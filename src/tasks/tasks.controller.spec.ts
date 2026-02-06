import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTask = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTasksService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('Debe retornar un array de tareas', async () => {
      // Arrange
      mockTasksService.findAll.mockResolvedValue([mockTask]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([mockTask]);
    });

    it('Debe lanzar error 500 si el servicio falla', async () => {
      // Arrange
      mockTasksService.findAll.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('Debe retornar una tarea por ID válido', async () => {
      // Arrange
      mockTasksService.findOne.mockResolvedValue(mockTask);

      // Act
      const result = await controller.findOne('507f1f77bcf86cd799439011');

      // Assert
      expect(result).toEqual(mockTask);
    });

    it('Debe lanzar BadRequestException si el ID es inválido', async () => {
      // Act & Assert
      await expect(controller.findOne('invalidId')).rejects.toThrow(BadRequestException);
    });

    it('Debe lanzar 404 si la tarea no existe', async () => {
      // Arrange
      mockTasksService.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        controller.findOne('507f1f77bcf86cd799439012'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    it('Debe crear una nueva tarea', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        completed: false,
      };
      mockTasksService.create.mockResolvedValue(mockTask);

      // Act
      const result = await controller.create(createTaskDto);

      // Assert
      expect(result).toEqual(mockTask);
      expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto);
    });

    it('Debe lanzar BadRequestException si el DTO está vacío', async () => {
      // Act & Assert
      await expect(controller.create({})).rejects.toThrow(BadRequestException);
    });

    it('Debe lanzar 409 si la tarea ya existe (título duplicado)', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: 'Existing Task',
      };
      mockTasksService.create.mockRejectedValue({ code: 11000 });

      // Act & Assert
      await expect(controller.create(createTaskDto)).rejects.toThrow(HttpException);
    });
  });

  describe('delete', () => {
    it('Debe eliminar una tarea', async () => {
      // Arrange
      mockTasksService.delete.mockResolvedValue(mockTask);

      // Act
      const result = await controller.remove('507f1f77bcf86cd799439011');

      // Assert
      expect(result.data).toEqual(mockTask);
      expect(mockTasksService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('Debe lanzar 404 si la tarea a eliminar no existe', async () => {
      // Arrange
      mockTasksService.delete.mockResolvedValue(null);

      // Act & Assert
      await expect(
        controller.remove('507f1f77bcf86cd799439012'),
      ).rejects.toThrow(HttpException);
    });

    it('Debe lanzar BadRequestException si el ID es inválido', async () => {
      // Act & Assert
      await expect(controller.remove('invalidId')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('Debe actualizar una tarea existente', async () => {
      // Arrange
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        completed: true,
      };
      const updatedTask = { ...mockTask, ...updateTaskDto };
      mockTasksService.update.mockResolvedValue(updatedTask);

      // Act
      const result = await controller.update('507f1f77bcf86cd799439011', updateTaskDto);

      // Assert
      expect(result.data.title).toBe('Updated Task');
      expect(mockTasksService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateTaskDto,
      );
    });

    it('Debe lanzar 404 si la tarea a actualizar no existe', async () => {
      // Arrange
      const updateTaskDto: UpdateTaskDto = { title: 'Updated' };
      mockTasksService.update.mockResolvedValue(null);

      // Act & Assert
      await expect(
        controller.update('507f1f77bcf86cd799439012', updateTaskDto),
      ).rejects.toThrow(HttpException);
    });

    it('Debe lanzar BadRequestException si el DTO está vacío', async () => {
      // Act & Assert
      await expect(controller.update('507f1f77bcf86cd799439011', {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('isValidMongoId', () => {
    it('Debe validar correctly MongoDB ObjectIds', () => {
      // Test válidos
      expect(controller['isValidMongoId']('507f1f77bcf86cd799439011')).toBe(true);
      expect(controller['isValidMongoId']('507f1f77bcf86cd799439012')).toBe(true);

      // Test inválidos
      expect(controller['isValidMongoId']('invalidId')).toBe(false);
      expect(controller['isValidMongoId']('123')).toBe(false);
      expect(controller['isValidMongoId']('')).toBe(false);
    });
  });
});
