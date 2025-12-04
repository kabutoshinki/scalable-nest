pipeline {
    agent any

    environment {
        APP_NAME = "scalable-nest-api"
    }

    stages {

        /* =======================
           GIT CHECKOUT
        ======================= */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* =======================
           SAFE ENV GENERATION
        ======================= */
        stage('Prepare ENV') {
            steps {
                withCredentials([
                    string(credentialsId: 'DATABASE_URL', variable: 'DBURL'),
                    string(credentialsId: 'REDIS_PASSWORD', variable: 'REDISPASS')
                ]) {
                    script {
                        writeFile file: '.env', text: """
PORT=3000
NODE_ENV=production

DATABASE_URL=${DBURL}

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

        /* =======================
           BUILD DOCKER IMAGE
        ======================= */
        stage('Build Docker Image') {
            steps {
                script {
                    IMAGE_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
                    sh "docker build -t ${APP_NAME}:${IMAGE_TAG} ."
                }
            }
        }

        /* =======================
           DEPLOY WITH DOCKER COMPOSE
        ======================= */
        stage('Deploy') {
            steps {
                script {
                    sh """
                    export IMAGE_TAG=${IMAGE_TAG}

                    docker-compose -f docker-compose.deploy.yml down || true

                    docker-compose -f docker-compose.deploy.yml up -d --build
                    """
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Deployment success for ${env.BRANCH_NAME}"
        }
        failure {
            echo "❌ Deployment failed — check logs"
        }
    }
}
