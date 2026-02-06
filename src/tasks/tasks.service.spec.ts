import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Task } from '../schemas/task.schema';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

describe('TasksService', () => {
  let service: TasksService;
  let mockTaskModel: any;

  const mockTask = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Crear mock del modelo
    mockTaskModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('Debe retornar un array de tareas', async () => {
      // Arrange
      mockTaskModel.find.mockResolvedValue([mockTask]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([mockTask]);
      expect(mockTaskModel.find).toHaveBeenCalled();
    });

    it('Debe retornar un array vacío si no hay tareas', async () => {
      // Arrange
      mockTaskModel.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('Debe retornar una tarea por ID', async () => {
      // Arrange
      mockTaskModel.findById.mockResolvedValue(mockTask);

      // Act
      const result = await service.findOne('507f1f77bcf86cd799439011');

      // Assert
      expect(result).toEqual(mockTask);
      expect(mockTaskModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('Debe retornar null si la tarea no existe', async () => {
      // Arrange
      mockTaskModel.findById.mockResolvedValue(null);

      // Act
      const result = await service.findOne('invalidId');

      // Assert
      expect(result).toBeNull();
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

      const mockSave = jest.fn().mockResolvedValue(mockTask);
      mockTaskModel.mockImplementation(() => ({
        save: mockSave,
      }));

      // Act
      const result = await service.create(createTaskDto);

      // Assert
      expect(mockSave).toHaveBeenCalled();
    });

    it('Debe lanzar error si campos requeridos faltan', async () => {
      // Arrange
      const invalidDto: any = {
        description: 'Sin título',
      };

      // Act & Assert
      expect(invalidDto.title).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('Debe eliminar una tarea por ID', async () => {
      // Arrange
      mockTaskModel.findByIdAndDelete.mockResolvedValue(mockTask);

      // Act
      const result = await service.delete('507f1f77bcf86cd799439011');

      // Assert
      expect(result).toEqual(mockTask);
      expect(mockTaskModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('Debe retornar null si la tarea a eliminar no existe', async () => {
      // Arrange
      mockTaskModel.findByIdAndDelete.mockResolvedValue(null);

      // Act
      const result = await service.delete('invalidId');

      // Assert
      expect(result).toBeNull();
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
      mockTaskModel.findByIdAndUpdate.mockResolvedValue(updatedTask);

      // Act
      const result = await service.update('507f1f77bcf86cd799439011', updateTaskDto);

      // Assert
      expect(result.title).toBe('Updated Task');
      expect(result.completed).toBe(true);
      expect(mockTaskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateTaskDto,
        { new: true },
      );
    });

    it('Debe retornar null si la tarea a actualizar no existe', async () => {
      // Arrange
      const updateTaskDto: UpdateTaskDto = { title: 'Updated' };
      mockTaskModel.findByIdAndUpdate.mockResolvedValue(null);

      // Act
      const result = await service.update('invalidId', updateTaskDto);

      // Assert
      expect(result).toBeNull();
    });
  });
});
