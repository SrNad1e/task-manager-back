# 📋 Task Manager API

API REST profesional para gestión de tareas construida con **NestJS**, **MongoDB** y **TypeScript**. Diseñada como demostración de mejores prácticas modernas en desarrollo backend.

## 🎯 Características Principales

### ✅ Funcionalidades
- **CRUD Completo** de tareas (Crear, Leer, Actualizar, Eliminar)
- **Validación robusta** en dos capas (DTOs + Schema MongoDB)
- **Manejo profesional de errores** con HTTP status codes apropiados
- **Logging estructurado** con niveles (log, debug, warn, error)
- **Health check endpoint** para monitoreo de producción
- **Timestamps automáticos** (createdAt, updatedAt)

### 🔐 Buenas Prácticas
- ✅ **Arquitectura modular** con separación de responsabilidades
- ✅ **Validación de entrada** con `class-validator`
- ✅ **Transformación de datos** con `class-transformer`
- ✅ **Configuración segura** con variables de entorno
- ✅ **Código limpio** y bien documentado
- ✅ **TypeScript** para type-safety

---

## 🚀 Quick Start

### Requisitos Previos
- Node.js v18+
- npm o yarn
- MongoDB local o URI remota

### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/task-manager-back.git
cd task-manager-back

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu MONGODB_URI
```

### Variables de Entorno (.env)
```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/task-manager

# Server
PORT=3000
HOST=localhost
```

### Ejecutar Proyecto

```bash
# Desarrollo (watch mode)
npm run start:dev

# Producción
npm run start:prod
```

El servidor estará disponible en: **http://localhost:3000**

---

## 📚 Documentación de API

### Endpoints Disponibles

#### **GET** `/health` - Health Check
Verifica que el servidor y MongoDB estén funcionando correctamente.

**Respuesta (200 OK):**
```json
{
  "status": "ok",
  "message": "Servidor funcionando correctamente",
  "timestamp": "2026-02-06T10:30:00.000Z",
  "database": "connected",
  "uptime": 123.45
}
```

---

#### **GET** `/tasks` - Obtener todas las tareas
Lista todas las tareas registradas.

**Respuesta (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Aprender NestJS",
    "description": "Dominar el framework NestJS",
    "completed": false,
    "createdAt": "2026-02-06T10:00:00.000Z",
    "updatedAt": "2026-02-06T10:00:00.000Z"
  }
]
```

---

#### **GET** `/tasks/:id` - Obtener tarea por ID
Recupera una tarea específica.

**Respuesta (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Aprender NestJS",
  "description": "Dominar el framework NestJS",
  "completed": false,
  "createdAt": "2026-02-06T10:00:00.000Z",
  "updatedAt": "2026-02-06T10:00:00.000Z"
}
```

**Errores:**
- `400` - ID inválido
- `404` - Tarea no encontrada

---

#### **POST** `/tasks` - Crear nueva tarea

**Body:**
```json
{
  "title": "Aprender NestJS",
  "description": "Dominar el framework NestJS",
  "completed": false
}
```

**Validaciones:**
- `title`: Requerido, 3-100 caracteres
- `description`: Opcional, máximo 500 caracteres
- `completed`: Opcional, debe ser boolean

**Respuesta (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Aprender NestJS",
  "description": "Dominar el framework NestJS",
  "completed": false,
  "createdAt": "2026-02-06T10:00:00.000Z",
  "updatedAt": "2026-02-06T10:00:00.000Z"
}
```

**Errores:**
- `400` - Validación fallida
- `409` - Título duplicado

---

#### **PUT** `/tasks/:id` - Actualizar tarea

**Body:**
```json
{
  "title": "Aprender NestJS avanzado",
  "completed": true
}
```

**Respuesta (200 OK):**
```json
{
  "message": "Tarea actualizada correctamente",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Aprender NestJS avanzado",
    "description": "Dominar el framework NestJS",
    "completed": true,
    "createdAt": "2026-02-06T10:00:00.000Z",
    "updatedAt": "2026-02-06T11:00:00.000Z"
  }
}
```

---

#### **DELETE** `/tasks/:id` - Eliminar tarea

**Respuesta (200 OK):**
```json
{
  "message": "Tarea eliminada correctamente",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Aprender NestJS",
    "description": "Dominar el framework NestJS",
    "completed": false,
    "createdAt": "2026-02-06T10:00:00.000Z",
    "updatedAt": "2026-02-06T10:00:00.000Z"
  }
}
```

---

## 🏗️ Arquitectura

```
src/
├── app.controller.ts        # Health check endpoint
├── app.module.ts            # Módulo raíz (configuración global)
├── main.ts                  # Entry point
├── dto/                     # Data Transfer Objects (validación)
│   ├── create-task.dto.ts
│   └── update-task.dto.ts
├── tasks/                   # Feature module
│   └── schemas/             # Esquemas MongoDB del módulo tasks
│       └── task.schema.ts
└── (modules)                # Módulos de la aplicación
  └── tasks/
    ├── tasks.controller.ts  # Endpoints HTTP
    ├── tasks.service.ts     # Lógica de negocio
    └── tasks.module.ts      # Configuración del módulo
```

### Flujo de una Solicitud

```
Usuario (HTTP Request)
    ↓
Controller (Validación de entrada)
    ↓
Service (Lógica de negocio)
    ↓
MongoDB (Persistencia)
    ↓
Response (JSON)
```

---

## 🧪 Testing (Próximamente)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📦 Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| NestJS | ^11.0 | Framework web |
| MongoDB | ^9.1.6 | Base de datos NoSQL |
| Mongoose | ^11.0.4 | ODM para MongoDB |
| TypeScript | ^5.x | Lenguaje con tipos |
| class-validator | ^0.14 | Validación de DTOs |
| class-transformer | ^0.5 | Transformación de datos |

---

## 🔒 Seguridad & Mejores Prácticas

- ✅ **Validación en dos capas:** DTOs + Schema MongoDB
- ✅ **Passwords y secretos en .env** (nunca en código)
- ✅ **HTTP status codes correctos** para cada situación
- ✅ **Mensajes de error genéricos** en producción
- ✅ **Logging de actividadades sospechosas**
- ✅ **Sanitización de entrada** automática

---

## 📊 Respuestas de Error

Todos los errores siguen este formato:

```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request"
}
```

| Status | Significado |
|--------|-------------|
| `200 OK` | Éxito |
| `201 Created` | Recurso creado exitosamente |
| `400 Bad Request` | Solicitud inválida (validación fallida) |
| `404 Not Found` | Recurso no encontrado |
| `409 Conflict` | Conflicto (e.g., duplicado) |
| `500 Internal Server Error` | Error del servidor |
| `503 Service Unavailable` | MongoDB desconectado |

---

## 🚀 Deployment

### Docker (Próximamente)
```bash
docker build -t task-manager-api .
docker run -p 3000:3000 task-manager-api
```

### Environment Variables para Producción
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/task-manager
```

---

## 📝 Licencia

MIT - Libre para usar en proyectos personales y comerciales

---

## 💡 Notas del Desarrollo

Este proyecto fue creado como portafolio profesional demostrando:

- Arquitectura limpia y modular
- Best practices de NestJS 11+
- Manejo robusto de errores
- Validación en múltiples capas
- Logging profesional
- Code organization y estructura clara

**Ideal para:** Entrevistas técnicas, portfolios, demostración de habilidades backend

---

## 📞 Contacto

Para preguntas o sugerencias: [Tu email/LinkedIn]

---

**Última actualización:** 6 de febrero de 2026
