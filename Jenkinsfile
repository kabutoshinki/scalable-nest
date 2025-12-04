pipeline {
    agent any

    environment {
        IMAGE_NAME = "scalable-nest-api"
        IMAGE_TAG = "dev-${BUILD_NUMBER}"
        DOCKER_COMPOSE = "docker-compose -f docker-compose.deploy.yml"
    }

    stages {

        /* -------------------------------
         * 1. CHECKOUT SOURCE CODE
         * ------------------------------- */
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/dev']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/kabutoshinki/scalable-nest.git',
                        credentialsId: 'jenkins-github-access-token'
                    ]]
                ])
            }
        }

        /* -------------------------------
         * 2. BUILD DOCKER IMAGE
         * ------------------------------- */
        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                        echo '🔨 Building image: ${IMAGE_NAME}:${IMAGE_TAG}'
                        docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    """
                }
            }
        }

        /* -------------------------------
         * 3. DEPLOY USING DOCKER COMPOSE
         * ------------------------------- */
        stage('Deploy') {
            steps {
                script {
                    // copy ENV cho Jenkins (nếu cần)
                    sh "cp .env.deploy .env || true"

                    sh """
                        echo '🛑 Stopping old containers...'
                        ${DOCKER_COMPOSE} down || true

                        echo '🚀 Starting new version using TAG: ${IMAGE_TAG}'
                        IMAGE_TAG=${IMAGE_TAG} ${DOCKER_COMPOSE} up -d --build
                    """
                }
            }
        }
    }

    /* -------------------------------
     * 4. ALWAYS RUN POST ACTIONS
     * ------------------------------- */
    post {
        success {
            echo "✅ Deployment successful — version ${IMAGE_TAG}"
        }
        failure {
            echo "❌ Deployment failed — check Jenkins logs."
        }
    }
}
