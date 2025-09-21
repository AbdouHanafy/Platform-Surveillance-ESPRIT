# Platform Surveillance - Exam Monitoring System

A comprehensive microservices-based platform for exam surveillance and monitoring at ESPRIT University, built with Spring Boot microservices and Angular frontend.

## 🏗️ Architecture Overview

### Backend Microservices (Spring Boot)
- **Eureka Server** (8761): Service discovery and registration
- **Config Server** (8888): Centralized configuration management  
- **API Gateway** (8065): API gateway and routing
- **User Service** (8081): User authentication and management
- **Emploi Du Temps Service** (8082): Schedule and timetable management
- **Fraude Service** (8083): Fraud detection and monitoring
- **Notifications Service** (8084): Real-time notifications
- **Salles Service** (8085): Room and classroom management

### Frontend
- **Angular Application** (4200): Modern web interface with PrimeNG components

### Database
- **MySQL** (3306): Centralized database for all microservices

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 17+
- Node.js 18+
- Maven 3.8+
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbdouHanafy/Platform-Surveillance-ESPRIT.git
   cd Platform-Surveillance-ESPRIT
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:4200
   - Eureka Dashboard: http://localhost:8761
   - API Gateway: http://localhost:8065

### Individual Service Development

#### Backend Services
```bash
# Navigate to specific service
cd "stage backend/[service-name]"

# Run with Maven
./mvnw spring-boot:run

# Or build and run JAR
./mvnw clean package
java -jar target/[service-name]-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
# Navigate to frontend
cd "stage frontend/stage frontend/Platforme_MicroService_Surveillances"

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🔧 Configuration

### Database Configuration
- **Host**: localhost
- **Port**: 3306
- **Database**: surveillance_exams
- **Username**: admin
- **Password**: admin

### Service Discovery
All microservices automatically register with Eureka server and can discover each other by service name.

### API Gateway Routes
- `/api/user/**` → User Service
- `/api/schedule/**` → Emploi Du Temps Service
- `/api/fraud/**` → Fraude Service
- `/api/notifications/**` → Notifications Service
- `/api/rooms/**` → Salles Service

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd "stage backend"
find . -name "pom.xml" -exec mvn -f {} test \;

# Frontend tests
cd "stage frontend/stage frontend/Platforme_MicroService_Surveillances"
npm test
```

### Integration Tests
```bash
# Start test environment
docker-compose -f docker-compose.yml -f docker-compose.test.yml up --build

# Run integration tests
npm run test:e2e
```

### Performance Testing
```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 http://localhost:8065/actuator/health
```

## 🚀 CI/CD Pipeline

### Jenkins Pipeline Features
- **Automated Testing**: Unit, integration, and performance tests
- **Code Quality**: ESLint, Checkstyle, SonarQube analysis
- **Security Scanning**: OWASP dependency check, Docker image scanning
- **Multi-Environment Deployment**: Development, Staging, Production
- **Blue-Green Deployment**: Zero-downtime production deployments

### Pipeline Setup
1. **Install Jenkins** with required plugins
2. **Configure Docker** integration
3. **Set up credentials** for GitHub and Docker registry
4. **Create pipeline job** pointing to this repository
5. **Configure environment variables** and global tools

See [jenkins-setup.md](jenkins-setup.md) for detailed setup instructions.

## 📊 Monitoring & Observability

### Health Checks
All services expose health endpoints at `/actuator/health`:
- Eureka: http://localhost:8761/actuator/health
- Config Server: http://localhost:8888/actuator/health
- API Gateway: http://localhost:8065/actuator/health
- Frontend: http://localhost:4200

### Metrics & Logging
- **Actuator Endpoints**: Built-in Spring Boot monitoring
- **Eureka Dashboard**: Service discovery status
- **Application Logs**: Structured logging with correlation IDs

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- OAuth2 integration ready

### Security Best Practices
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Secure headers configuration

## 📈 Performance

### Optimization Features
- Database connection pooling
- Redis caching (optional)
- Response compression
- Static resource optimization
- Docker multi-stage builds

### Scalability
- Horizontal scaling with Docker Swarm/Kubernetes
- Load balancing with API Gateway
- Database read replicas support
- Microservice isolation

## 🛠️ Development

### Code Style
- **Backend**: Java coding standards, Checkstyle configuration
- **Frontend**: ESLint, Prettier, Angular style guide
- **Git**: Conventional commit messages

### API Documentation
- **Swagger/OpenAPI**: Available at `/swagger-ui.html` for each service
- **Postman Collection**: Available in `/docs` directory

### Database Migrations
- Flyway integration for database versioning
- Liquibase support available

## 🐳 Docker

### Container Images
- **Base Images**: OpenJDK 17, Node.js 18, MySQL 8.0
- **Multi-stage Builds**: Optimized for production
- **Health Checks**: Built-in container health monitoring

### Docker Compose Files
- `docker-compose.yml`: Main development/production setup
- `docker-compose.test.yml`: Testing environment
- `docker-compose.prod.yml`: Production optimizations

## 📚 Documentation

- [Docker Setup Guide](DOCKER_SETUP_README.md)
- [Jenkins CI/CD Setup](jenkins-setup.md)
- [API Documentation](docs/api/)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow coding standards and style guides
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all CI/CD checks pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Abdou Hanafy** - Lead Developer
- **ESPRIT University** - Academic Institution

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in the `/docs` directory

## 🗺️ Roadmap

### Upcoming Features
- [ ] Real-time video monitoring integration
- [ ] AI-powered fraud detection
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant architecture
- [ ] Kubernetes deployment manifests

### Version History
- **v1.0.0**: Initial release with core microservices
- **v1.1.0**: Added CI/CD pipeline and monitoring
- **v1.2.0**: Enhanced security and performance optimizations

---

**Built with ❤️ for ESPRIT University**

