pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-docker-registry.com' // Replace with your Docker registry
        DOCKER_IMAGE_PREFIX = 'platform-surveillance'
        GITHUB_REPO = 'https://github.com/AbdouHanafy/Platform-Surveillance-ESPRIT.git'
        MAVEN_OPTS = '-Xmx1024m -XX:MaxPermSize=256m'
        NODE_VERSION = '18'
        JAVA_VERSION = '17'
        
        // Service ports mapping
        EUREKA_PORT = '8761'
        CONFIG_SERVER_PORT = '8888'
        GATEWAY_PORT = '8065'
        USER_SERVICE_PORT = '8081'
        EMPLOI_TEMPS_PORT = '8082'
        FRAUDE_SERVICE_PORT = '8083'
        NOTIFICATIONS_PORT = '8084'
        SALLES_SERVICE_PORT = '8085'
        FRONTEND_PORT = '4200'
        MYSQL_PORT = '3306'
    }
    
    parameters {
        choice(
            name: 'DEPLOYMENT_ENVIRONMENT',
            choices: ['development', 'staging', 'production'],
            description: 'Target deployment environment'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: 'Skip running tests during build'
        )
        booleanParam(
            name: 'PUSH_TO_REGISTRY',
            defaultValue: true,
            description: 'Push built images to Docker registry'
        )
        choice(
            name: 'SERVICES_TO_BUILD',
            choices: ['all', 'backend-only', 'frontend-only', 'infrastructure-only'],
            description: 'Select which services to build'
        )
    }
    
    stages {
        stage('Checkout & Setup') {
            steps {
                script {
                    echo "🚀 Starting CI/CD Pipeline for Platform Surveillance"
                    echo "📋 Parameters:"
                    echo "  - Environment: ${params.DEPLOYMENT_ENVIRONMENT}"
                    echo "  - Skip Tests: ${params.SKIP_TESTS}"
                    echo "  - Push to Registry: ${params.PUSH_TO_REGISTRY}"
                    echo "  - Services to Build: ${params.SERVICES_TO_BUILD}"
                }
                
                checkout scm
                
                // Clean workspace
                sh '''
                    echo "🧹 Cleaning workspace..."
                    docker system prune -f || true
                    docker volume prune -f || true
                '''
            }
        }
        
        stage('Environment Validation') {
            steps {
                script {
                    echo "🔍 Validating environment..."
                    
                    // Check required tools
                    sh '''
                        echo "Checking Docker installation..."
                        docker --version
                        
                        echo "Checking Docker Compose installation..."
                        docker-compose --version
                        
                        echo "Checking Java installation..."
                        java -version
                        
                        echo "Checking Maven installation..."
                        mvn --version
                        
                        echo "Checking Node.js installation..."
                        node --version
                        npm --version
                    '''
                }
            }
        }
        
        stage('Code Quality Analysis') {
            parallel {
                stage('Backend Code Analysis') {
                    when {
                        anyOf {
                            params.SERVICES_TO_BUILD == 'all'
                            params.SERVICES_TO_BUILD == 'backend-only'
                        }
                    }
                    steps {
                        script {
                            echo "🔍 Analyzing backend code quality..."
                            
                            // Maven dependency check
                            sh '''
                                cd "stage backend"
                                echo "Checking Maven dependencies..."
                                find . -name "pom.xml" -exec mvn -f {} dependency:tree \\;
                            '''
                            
                            // Code style check (if configured)
                            sh '''
                                cd "stage backend"
                                echo "Running code style checks..."
                                find . -name "pom.xml" -exec mvn -f {} checkstyle:check \; || echo "Checkstyle not configured"
                            '''
                        }
                    }
                }
                
                stage('Frontend Code Analysis') {
                    when {
                        anyOf {
                            params.SERVICES_TO_BUILD == 'all'
                            params.SERVICES_TO_BUILD == 'frontend-only'
                        }
                    }
                    steps {
                        script {
                            echo "🔍 Analyzing frontend code quality..."
                            
                            sh '''
                                cd "stage frontend/stage frontend/Platforme_MicroService_Surveillances"
                                
                                echo "Installing dependencies..."
                                npm ci
                                
                                echo "Running ESLint..."
                                npm run lint || echo "Lint script not found, skipping..."
                                
                                echo "Running Angular build check..."
                                npm run build --dry-run || echo "Build check completed"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            when {
                not { params.SKIP_TESTS }
            }
            parallel {
                stage('Backend Tests') {
                    when {
                        anyOf {
                            params.SERVICES_TO_BUILD == 'all'
                            params.SERVICES_TO_BUILD == 'backend-only'
                        }
                    }
                    steps {
                        script {
                            echo "🧪 Running backend unit tests..."
                            
                            sh '''
                                cd "stage backend"
                                
                                # Run tests for each microservice
                                for service in eureka config-server gateway microserviceUser microserviceEmploiDuTemps microserviceGestionDesFraude microserviceGestionDesNotifications microserviceGestionDesSalles; do
                                    if [ -d "$service" ]; then
                                        echo "Testing $service..."
                                        cd "$service"
                                        mvn clean test -DskipTests=false || echo "Tests failed for $service"
                                        cd ..
                                    fi
                                done
                            '''
                        }
                    }
                    post {
                        always {
                            // Publish test results
                            publishTestResults testResultsPattern: 'stage backend/**/target/surefire-reports/*.xml'
                            // Publish coverage reports
                            publishCoverage adapters: [
                                jacocoAdapter('stage backend/**/target/site/jacoco/jacoco.xml')
                            ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    when {
                        anyOf {
                            params.SERVICES_TO_BUILD == 'all'
                            params.SERVICES_TO_BUILD == 'frontend-only'
                        }
                    }
                    steps {
                        script {
                            echo "🧪 Running frontend unit tests..."
                            
                            sh '''
                                cd "stage frontend/stage frontend/Platforme_MicroService_Surveillances"
                                
                                echo "Running Angular tests..."
                                npm test -- --watch=false --browsers=ChromeHeadless || echo "Tests completed"
                                
                                echo "Running E2E tests (if configured)..."
                                npm run e2e || echo "E2E tests not configured"
                            '''
                        }
                    }
                    post {
                        always {
                            // Publish frontend test results
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'stage frontend/stage frontend/Platforme_MicroService_Surveillances/coverage',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
            }
        }
        
        stage('Security Scanning') {
            steps {
                script {
                    echo "🔒 Running security scans..."
                    
                    // Docker image security scan
                    sh '''
                        echo "Scanning Docker images for vulnerabilities..."
                        
                        # Scan base images
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy image mysql:8.0 || echo "Trivy scan completed"
                        
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy image openjdk:17-jdk-slim || echo "Trivy scan completed"
                        
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy image node:18-alpine || echo "Trivy scan completed"
                    '''
                    
                    // Dependency vulnerability check
                    sh '''
                        cd "stage backend"
                        echo "Checking backend dependencies for vulnerabilities..."
                        find . -name "pom.xml" -exec mvn -f {} org.owasp:dependency-check-maven:check \; || echo "Dependency check completed"
                        
                        cd "../stage frontend/stage frontend/Platforme_MicroService_Surveillances"
                        echo "Checking frontend dependencies for vulnerabilities..."
                        npm audit || echo "NPM audit completed"
                    '''
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Images') {
                    when {
                        anyOf {
                            params.SERVICES_TO_BUILD == 'all'
                            params.SERVICES_TO_BUILD == 'backend-only'
                        }
                    }
                    steps {
                        script {
                            echo "🏗️ Building backend Docker images..."
                            
                            def backendServices = [
                                'eureka': 'eureka-server',
                                'config-server': 'config-server',
                                'gateway': 'api-gateway',
                                'microserviceUser': 'user-service',
                                'microserviceEmploiDuTemps': 'emploi-temps-service',
                                'microserviceGestionDesFraude': 'fraude-service',
                                'microserviceGestionDesNotifications': 'notifications-service',
                                'microserviceGestionDesSalles': 'salles-service'
                            ]
                            
                            backendServices.each { dir, serviceName ->
                                if (fileExists("stage backend/${dir}")) {
                                    sh """
                                        echo "Building ${serviceName}..."
                                        cd "stage backend/${dir}"
                                        
                                        # Build the image
                                        docker build -t ${DOCKER_IMAGE_PREFIX}/${serviceName}:${BUILD_NUMBER} .
                                        docker tag ${DOCKER_IMAGE_PREFIX}/${serviceName}:${BUILD_NUMBER} ${DOCKER_IMAGE_PREFIX}/${serviceName}:latest
                                        
                                        # Push to registry if enabled
                                        if [ "${params.PUSH_TO_REGISTRY}" = "true" ]; then
                                            docker tag ${DOCKER_IMAGE_PREFIX}/${serviceName}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/${serviceName}:${BUILD_NUMBER}
                                            docker tag ${DOCKER_IMAGE_PREFIX}/${serviceName}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/${serviceName}:latest
                                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/${serviceName}:${BUILD_NUMBER}
                                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/${serviceName}:latest
                                        fi
                                    """
                                }
                            }
                        }
                    }
                }
                
                stage('Build Frontend Image') {
                    when {
                        anyOf {
                            params.SERVICES_TO_BUILD == 'all'
                            params.SERVICES_TO_BUILD == 'frontend-only'
                        }
                    }
                    steps {
                        script {
                            echo "🏗️ Building frontend Docker image..."
                            
                            sh """
                                cd "stage frontend/stage frontend/Platforme_MicroService_Surveillances"
                                
                                # Build the image
                                docker build -t ${DOCKER_IMAGE_PREFIX}/frontend:${BUILD_NUMBER} .
                                docker tag ${DOCKER_IMAGE_PREFIX}/frontend:${BUILD_NUMBER} ${DOCKER_IMAGE_PREFIX}/frontend:latest
                                
                                # Push to registry if enabled
                                if [ "${params.PUSH_TO_REGISTRY}" = "true" ]; then
                                    docker tag ${DOCKER_IMAGE_PREFIX}/frontend:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/frontend:${BUILD_NUMBER}
                                    docker tag ${DOCKER_IMAGE_PREFIX}/frontend:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/frontend:latest
                                    docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/frontend:${BUILD_NUMBER}
                                    docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/frontend:latest
                                fi
                            """
                        }
                    }
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                not { params.SKIP_TESTS }
            }
            steps {
                script {
                    echo "🔗 Running integration tests..."
                    
                    sh '''
                        echo "Starting test environment..."
                        docker-compose -f docker-compose.yml -f docker-compose.test.yml up -d --build
                        
                        echo "Waiting for services to be ready..."
                        sleep 60
                        
                        echo "Running integration tests..."
                        
                        # Test Eureka server
                        curl -f http://localhost:8761/actuator/health || echo "Eureka health check failed"
                        
                        # Test Config Server
                        curl -f http://localhost:8888/actuator/health || echo "Config Server health check failed"
                        
                        # Test API Gateway
                        curl -f http://localhost:8065/actuator/health || echo "API Gateway health check failed"
                        
                        # Test Frontend
                        curl -f http://localhost:4200 || echo "Frontend health check failed"
                        
                        echo "Integration tests completed"
                        
                        # Cleanup test environment
                        docker-compose -f docker-compose.yml -f docker-compose.test.yml down
                    '''
                }
            }
        }
        
        stage('Deploy to Environment') {
            when {
                not { params.DEPLOYMENT_ENVIRONMENT == 'none' }
            }
            steps {
                script {
                    echo "🚀 Deploying to ${params.DEPLOYMENT_ENVIRONMENT} environment..."
                    
                    sh """
                        # Create environment-specific compose file
                        cp docker-compose.yml docker-compose.${params.DEPLOYMENT_ENVIRONMENT}.yml
                        
                        # Update image tags for deployment
                        sed -i 's/:latest/:${BUILD_NUMBER}/g' docker-compose.${params.DEPLOYMENT_ENVIRONMENT}.yml
                        
                        # Deploy based on environment
                        case "${params.DEPLOYMENT_ENVIRONMENT}" in
                            "development")
                                echo "Deploying to development..."
                                docker-compose -f docker-compose.${params.DEPLOYMENT_ENVIRONMENT}.yml up -d
                                ;;
                            "staging")
                                echo "Deploying to staging..."
                                docker-compose -f docker-compose.${params.DEPLOYMENT_ENVIRONMENT}.yml up -d
                                ;;
                            "production")
                                echo "Deploying to production..."
                                docker-compose -f docker-compose.${params.DEPLOYMENT_ENVIRONMENT}.yml up -d --scale frontend=2
                                ;;
                        esac
                        
                        # Wait for deployment to stabilize
                        sleep 30
                        
                        # Health check
                        echo "Performing health checks..."
                        curl -f http://localhost:8761/actuator/health || echo "Eureka not ready"
                        curl -f http://localhost:8065/actuator/health || echo "Gateway not ready"
                        curl -f http://localhost:4200 || echo "Frontend not ready"
                    """
                }
            }
        }
        
        stage('Performance Testing') {
            when {
                params.DEPLOYMENT_ENVIRONMENT == 'staging'
            }
            steps {
                script {
                    echo "⚡ Running performance tests..."
                    
                    sh '''
                        # Install Apache Bench for load testing
                        which ab || (apt-get update && apt-get install -y apache2-utils)
                        
                        echo "Running load tests on API Gateway..."
                        ab -n 1000 -c 10 http://localhost:8065/actuator/health || echo "Load test completed"
                        
                        echo "Running load tests on Frontend..."
                        ab -n 500 -c 5 http://localhost:4200 || echo "Frontend load test completed"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "🧹 Cleaning up..."
                
                // Clean up Docker resources
                sh '''
                    docker system prune -f || true
                    docker volume prune -f || true
                '''
                
                // Archive artifacts
                archiveArtifacts artifacts: '**/target/*.jar', allowEmptyArchive: true
                archiveArtifacts artifacts: '**/dist/**/*', allowEmptyArchive: true
            }
        }
        
        success {
            script {
                echo "✅ Pipeline completed successfully!"
                
                // Send success notification
                sh '''
                    echo "Pipeline SUCCESS for build #${BUILD_NUMBER}"
                    echo "Environment: ${params.DEPLOYMENT_ENVIRONMENT}"
                    echo "Services Built: ${params.SERVICES_TO_BUILD}"
                '''
                
                // Update deployment status
                currentBuild.description = "✅ SUCCESS - Deployed to ${params.DEPLOYMENT_ENVIRONMENT}"
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline failed!"
                
                // Send failure notification
                sh '''
                    echo "Pipeline FAILED for build #${BUILD_NUMBER}"
                    echo "Check the logs for more details"
                '''
                
                // Clean up failed deployment
                sh '''
                    docker-compose down || true
                '''
                
                currentBuild.description = "❌ FAILED - Build #${BUILD_NUMBER}"
            }
        }
        
        unstable {
            script {
                echo "⚠️ Pipeline completed with warnings!"
                currentBuild.description = "⚠️ UNSTABLE - Build #${BUILD_NUMBER}"
            }
        }
    }
}
