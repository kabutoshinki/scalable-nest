pipeline {
    agent any

    environment {
        APP_NAME = "scalable-nest-api"
    }

    stages {

        /* =====================
           CHECKOUT SOURCE CODE
           ===================== */
        stage('Checkout') {
            steps {
                checkout scm
                echo "Checked out branch: ${env.BRANCH_NAME}"
            }
        }

        /* =====================
           GENERATE .ENV SAFELY
           ===================== */
        stage('Prepare ENV') {
            steps {
                withCredentials([
                    string(credentialsId: 'DATABASE_URL', variable: 'DBURL'),
                    string(credentialsId: 'REDIS_PASSWORD', variable: 'REDISPASS')
                ]) {
                    script {
                        writeFile file: '.env', text: """
# API
PORT=3000
NODE_ENV=production

# Postgres
DATABASE_URL=${DBURL}

# Redis Sentinel
REDIS_MASTER_NAME=mymaster
REDIS_PASSWORD=${REDISPASS}
REDIS_SENTINEL_1_HOST=redis-sentinel-1
REDIS_SENTINEL_1_PORT=26379
REDIS_SENTINEL_2_HOST=redis-sentinel-2
REDIS_SENTINEL_2_PORT=26379
REDIS_SENTINEL_3_HOST=redis-sentinel-3
REDIS_SENTINEL_3_PORT=26379
"""
                    }
                }
            }
        }

        /* =====================
           BUILD DOCKER IMAGE
           ===================== */
        stage('Build Docker Image') {
            steps {
                script {
                    IMAGE_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"

                    sh """
                    echo "Building Docker image: ${APP_NAME}:${IMAGE_TAG}"
                    docker build -t ${APP_NAME}:${IMAGE_TAG} .
                    """
                }
            }
        }

        /* =====================
           DEPLOY USING DOCKER COMPOSE
           ===================== */
        stage('Deploy') {
            steps {
                script {
                    sh """
                    echo "Stopping old containers..."
                    docker-compose down || true

                    echo "Starting new containers with build: ${IMAGE_TAG}"
                    docker-compose up -d --build
                    """
                }
            }
        }
    }

    /* =====================
       POST BUILD NOTIFICATION
       ===================== */
    post {
        success {
            echo "BUILD SUCCESS — Deployment completed for ${env.BRANCH_NAME}"
        }
        failure {
            echo "BUILD FAILED — Check Jenkins logs."
        }
    }
}
