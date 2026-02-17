# GlobalThink Challenge

A RESTful API built with NestJS following Clean Architecture principles, providing authentication and user management functionality.


## ✨ Features

- **Authentication System**
  - User registration and login
  - JWT-based authentication (Access & Refresh tokens)
  - Secure password hashing with bcrypt
  - Token invalidation after user deletion
  - Automatic logout functionality

- **User Management**
  - User profile creation and updates
  - Get user by ID
  - List all users
  - Delete user account (with automatic token invalidation)

- **Security Features**
  - Clean Architecture for better maintainability
  - Token validation with database verification
  - Protected routes with JWT guards
  - Authorization checks (users can only modify their own data)

## 🛠 Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) v11
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Passport JWT Strategy
- **Validation:** Class Validator & Class Transformer
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest (Unit & E2E tests)
- **Containerization:** Docker & Docker Compose

## 🏗 Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── modules/
│   ├── auth/              # Authentication module
│   │   ├── domain/        # Business logic & interfaces
│   │   ├── application/   # Use cases
│   │   ├── infrastructure/ # External services & implementations
│   │   └── presentation/  # Controllers & DTOs
│   ├── users/             # User management module
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── shared/            # Shared utilities & services
```

**Key Principles:**
- Dependency Inversion: Modules depend on abstractions, not implementations
- Independent modules with clear boundaries
- Domain layer has no external dependencies
- Infrastructure implements domain interfaces

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- Yarn package manager
- MongoDB (local or Docker)
- Docker & Docker Compose (optional, for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd global-challenge
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp .env.test.example .env.test
   ```

4. **Start MongoDB** (if using local MongoDB)
   ```bash
   mongod
   ```

## 💻 Development

### Run the application

```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

The API will be available at: **http://localhost:3000**

### Code Quality

```bash
# Format code
yarn format

# Lint and auto-fix
yarn lint
```

## 🧪 Testing

This project includes comprehensive unit and end-to-end tests.

```bash
# Run unit tests
yarn test

# Run unit tests in watch mode
yarn test:watch

# Run e2e tests
yarn test:e2e

# Generate unit test coverage report
yarn test:cov

# Generate e2e test coverage report
yarn test:e2e:cov
```

### Test Coverage

The project maintains separate coverage reports for unit and e2e tests:

- **Unit tests** (`yarn test:cov`): Coverage for individual components, services, and use cases
  - Reports saved to `./coverage/`
  
- **E2E tests** (`yarn test:e2e:cov`): Coverage showing which source code is exercised by integration tests
  - Reports saved to `./coverage-e2e/`

**Current E2E Test Suite:**
```
-----------------------------------------------------------|---------|----------|---------|---------|-------------------
File                                                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------------------------------------------|---------|----------|---------|---------|-------------------
All files                                                  |   92.68 |    80.86 |   85.14 |   94.81 |                   
 src                                                       |     100 |       75 |     100 |     100 |                   
  app.controller.ts                                        |     100 |       75 |     100 |     100 | 8                 
  app.service.ts                                           |     100 |      100 |     100 |     100 |                   
  setup-app.ts                                             |     100 |      100 |     100 |     100 |                   
 src/modules/auth/application/use-cases                    |    98.7 |    91.66 |     100 |   98.55 |                   
  login.use-case.ts                                        |     100 |      100 |     100 |     100 |                   
  logout.use-case.ts                                       |     100 |      100 |     100 |     100 |                   
  refresh-token.use-case.ts                                |   95.65 |    83.33 |     100 |   95.23 | 42                
  register.use-case.ts                                     |     100 |      100 |     100 |     100 |                   
 src/modules/auth/domain/constants                         |     100 |      100 |     100 |     100 |                   
  auth.constants.ts                                        |     100 |      100 |     100 |     100 |                   
 src/modules/auth/domain/exceptions                        |     100 |      100 |     100 |     100 |                   
  auth.exceptions.ts                                       |     100 |      100 |     100 |     100 |                   
  email-already-in-use.exception.ts                        |     100 |      100 |     100 |     100 |                   
  invalid-access-token.exception.ts                        |     100 |      100 |     100 |     100 |                   
  invalid-credentials.exception.ts                         |     100 |      100 |     100 |     100 |                   
  invalid-refresh-token.exception.ts                       |     100 |      100 |     100 |     100 |                   
 src/modules/auth/infrastructure/guards                    |     100 |      100 |     100 |     100 |                   
  jwt-refresh.guard.ts                                     |     100 |      100 |     100 |     100 |                   
 src/modules/auth/infrastructure/services                  |   95.23 |       75 |      80 |   94.11 |                   
  bcrypt-hasher.service.ts                                 |     100 |      100 |     100 |     100 |                   
  jwt-token.service.ts                                     |   86.66 |       75 |      50 |   84.61 | 46-52             
  sha256-token-hasher.service.ts                           |     100 |      100 |     100 |     100 |                   
  user-validator.service.ts                                |     100 |      100 |     100 |     100 |                   
 src/modules/auth/infrastructure/strategies                |    92.3 |    79.16 |     100 |   91.42 |                   
  jwt-access.strategy.ts                                   |   94.44 |    81.81 |     100 |   93.75 | 29                
  jwt-refresh.strategy.ts                                  |   90.47 |    76.92 |     100 |   89.47 | 33,37             
 src/modules/auth/presentation/api                         |     100 |      100 |     100 |     100 |                   
  response-properties.ts                                   |     100 |      100 |     100 |     100 |                   
 src/modules/auth/presentation/controllers                 |     100 |       75 |     100 |     100 |                   
  auth.controller.ts                                       |     100 |       75 |     100 |     100 | 42-104            
 src/modules/shared/domain/enums                           |     100 |      100 |     100 |     100 |                   
  sort-direction.enum.ts                                   |     100 |      100 |     100 |     100 |                   
 src/modules/shared/domain/exceptions                      |     100 |      100 |     100 |     100 |                   
  domain.exception.ts                                      |     100 |      100 |     100 |     100 |                   
 src/modules/shared/infrastructure/decorators              |     100 |      100 |     100 |     100 |                   
  auth.decorator.ts                                        |     100 |      100 |     100 |     100 |                   
  user-id.decorator.ts                                     |     100 |      100 |     100 |     100 |                   
 src/modules/shared/infrastructure/filters                 |     100 |       25 |     100 |     100 |                   
  domain-exception.filter.ts                               |     100 |      100 |     100 |     100 |                   
  validation-exception.filter.ts                           |     100 |       25 |     100 |     100 | 17-29             
 src/modules/shared/infrastructure/guards                  |     100 |      100 |     100 |     100 |                   
  jwt-auth.guard.ts                                        |     100 |      100 |     100 |     100 |                   
 src/modules/shared/infrastructure/services                |     100 |       75 |     100 |     100 |                   
  custom-config.service.ts                                 |     100 |       75 |     100 |     100 | 15                
 src/modules/shared/infrastructure/utils                   |     100 |      100 |     100 |     100 |                   
  mongo-sort.util.ts                                       |     100 |      100 |     100 |     100 |                   
 src/modules/shared/presentation/api                       |     100 |      100 |     100 |     100 |                   
  build-error-response.properties.ts                       |     100 |      100 |     100 |     100 |                   
 src/modules/shared/test                                   |       0 |      100 |       0 |       0 |                   
  factories.ts                                             |       0 |      100 |       0 |       0 | 1-29              
  mocks.ts                                                 |       0 |      100 |       0 |       0 | 7-39              
 src/modules/users/application/use-cases                   |     100 |      100 |     100 |     100 |                   
  delete-user-by-id.use-case.ts                            |     100 |      100 |     100 |     100 |                   
  find-user-by-id.use-case.ts                              |     100 |      100 |     100 |     100 |                   
  find-users.use-case.ts                                   |     100 |      100 |     100 |     100 |                   
  update-user-profile-by-id.use-case.ts                    |     100 |      100 |     100 |     100 |                   
 src/modules/users/domain/exceptions                       |     100 |      100 |     100 |     100 |                   
  email-already-in-use.exception.ts                        |     100 |      100 |     100 |     100 |                   
  user-not-allowed-to-delete.exception.ts                  |     100 |      100 |     100 |     100 |                   
  user-not-allowed-to-edit.exception.ts                    |     100 |      100 |     100 |     100 |                   
  user.exceptions.ts                                       |     100 |      100 |     100 |     100 |                   
 src/modules/users/domain/repositories                     |     100 |      100 |     100 |     100 |                   
  repository.tokens.ts                                     |     100 |      100 |     100 |     100 |                   
 src/modules/users/infrastructure/persistence/mappers      |      80 |      100 |   66.66 |      80 |                   
  profile.mapper.ts                                        |     100 |      100 |     100 |     100 |                   
  user.mapper.ts                                           |   66.66 |      100 |      50 |   66.66 | 17                
 src/modules/users/infrastructure/persistence/repositories |   88.88 |       90 |   78.94 |   89.58 |                   
  profile.repository.ts                                    |      90 |    91.66 |   77.77 |   92.59 | 49-50             
  user.repository.ts                                       |    87.5 |     87.5 |      80 |   85.71 | 46-52             
 src/modules/users/presentation/api                        |     100 |      100 |     100 |     100 |                   
  request-properties.ts                                    |     100 |      100 |     100 |     100 |                   
  response-properties.ts                                   |     100 |      100 |     100 |     100 |                   
 src/modules/users/presentation/controllers                |     100 |    73.68 |     100 |     100 |                   
  users.controller.ts                                      |     100 |    73.68 |     100 |     100 | 48-130            
-----------------------------------------------------------|---------|----------|---------|---------|-------------------

Test Suites: 9 passed, 9 total
Tests:       44 passed, 44 total
Snapshots:   0 total
Time:        11.253 s
Ran all test suites.
✨  Done in 12.46s.
```

**Note:** Coverage excludes declarations-only files (DTOs, interfaces, entities, schemas, modules) to focus on business logic.

## 📚 API Documentation

### Swagger Documentation

Once the application is running, access the interactive API documentation at:

**[http://localhost:3000/api](http://localhost:3000/api)**

### Available Endpoints

#### Authentication (`/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and invalidate refresh token

#### Users (`/users`)
- `GET /users` - Get all users (requires authentication)
- `GET /users/:userId` - Get user by ID (requires authentication)
- `PUT /users/:userId` - Update user profile (requires authentication, own profile only)
- `DELETE /users/:userId` - Delete user account (requires authentication, own account only)

#### Endpoints to improve
I did it that way because the challenge required it, but I disagree. I think DELETE /users/:userId should be /users/me because a user can only delete themselves. The same applies to PUT /users/:userid.
That way is more semantical.

The search, is not using any index (regex doesn't use index). The best approach here, should be use MongoDB Atlas

## 🐳 Docker

Run the entire application stack (MongoDB + Backend) using Docker Compose:

```bash
# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v
```

### Docker Services

- **MongoDB:** Accessible on `localhost:27017`
- **Backend API:** Accessible on `localhost:3000`

## 📁 Project Structure

```
global-challenge/
├── src/
│   ├── modules/
│   │   ├── auth/                # Authentication module
│   │   │   ├── application/     # Use cases (login, register, logout, etc.)
│   │   │   ├── domain/          # Entities, interfaces, exceptions
│   │   │   ├── infrastructure/  # Services, strategies, guards
│   │   │   └── presentation/    # Controllers, DTOs, API docs
│   │   ├── users/               # User management module
│   │   │   ├── application/     # User use cases
│   │   │   ├── domain/          # User entities & interfaces
│   │   │   ├── infrastructure/  # Repositories, schemas
│   │   │   └── presentation/    # Controllers & DTOs
│   │   └── shared/              # Shared utilities
│   │       ├── database/        # MongoDB configuration
│   │       ├── infrastructure/  # Global filters, guards, decorators
│   │       └── domain/          # Shared exceptions & enums
│   ├── main.ts                  # Application entry point
│   └── setup-app.ts             # App configuration
├── test/                        # E2E tests
│   ├── auth/                    # Auth E2E tests
│   ├── users/                   # Users E2E tests
│   ├── factories/               # Test data factories
│   └── helpers/                 # Test utilities
├── docker-compose.yml           # Docker configuration
├── Dockerfile                   # Docker image definition
└── README.md                    # This file
```

## 🔒 Security Considerations

- **Password Hashing:** All passwords are hashed using bcrypt
- **JWT Tokens:** Access tokens expire in 15 minutes
- **Token Validation:** Tokens are validated against the database on each request
- **Deleted Users:** Tokens are automatically invalidated when a user is deleted
- **Authorization:** Users can only modify their own data
- **Environment Variables:** Sensitive data stored in `.env` files (not committed)


**Backend API:** [http://localhost:3000/api](http://localhost:3000/api)
