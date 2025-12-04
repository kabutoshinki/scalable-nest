pipeline {
    agent any

    triggers {
        pollSCM('* * * * *') // check mỗi phút
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def imageName = "scalable-nest-api"
                    def tag = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"

                    sh """
                        docker build -t ${imageName}:${tag} .
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh """
                        docker-compose down
                        docker-compose up -d --build
                    """
                }
            }
        }
    }
}
