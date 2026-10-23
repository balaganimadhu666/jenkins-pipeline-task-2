// Declarative Jenkins pipeline: Checkout -> Install -> Test -> Build -> (Push) -> Deploy -> Verify
pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    // Triggers: run on every commit.
    //  - githubPush() reacts to a GitHub webhook (instant, needs Jenkins reachable from the internet)
    //  - pollSCM() is the fallback: Jenkins checks the repo every ~2 minutes (works on localhost)
    // Note: triggers declared here become active after the first build has run once.
    triggers {
        githubPush()
        pollSCM('H/2 * * * *')
    }

    parameters {
        booleanParam(name: 'PUSH_TO_DOCKERHUB', defaultValue: false,
                     description: 'Also push the image to Docker Hub (needs the "dockerhub-creds" credential)')
    }

    environment {
        APP_NAME  = 'jenkins-demo-app'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        HOST_PORT = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'node --version && npm --version && docker --version'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test:ci'
            }
            post {
                always {
                    // Shows test results/trends on the Jenkins dashboard
                    junit allowEmptyResults: true, testResults: 'test-results.xml'
                }
            }
        }

        stage('Build Docker image') {
            steps {
                sh 'docker build -t ${APP_NAME}:${IMAGE_TAG} -t ${APP_NAME}:latest .'
            }
        }

        stage('Push to Docker Hub (optional)') {
            when { expression { params.PUSH_TO_DOCKERHUB } }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                  usernameVariable: 'DH_USER',
                                                  passwordVariable: 'DH_TOKEN')]) {
                    // Single quotes: the shell reads the secrets, Groovy never interpolates them
                    sh '''
                        echo "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin
                        docker tag ${APP_NAME}:${IMAGE_TAG} $DH_USER/${APP_NAME}:${IMAGE_TAG}
                        docker tag ${APP_NAME}:${IMAGE_TAG} $DH_USER/${APP_NAME}:latest
                        docker push $DH_USER/${APP_NAME}:${IMAGE_TAG}
                        docker push $DH_USER/${APP_NAME}:latest
                        docker logout
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                // Replace the running container with the freshly built image
                sh '''
                    docker rm -f ${APP_NAME} || true
                    docker run -d --name ${APP_NAME} --restart unless-stopped \
                        -p ${HOST_PORT}:3000 ${APP_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Verify deployment') {
            steps {
                // Health check from inside the container (works even though Jenkins itself runs in Docker)
                sh '''
                    for i in $(seq 1 10); do
                        if docker exec ${APP_NAME} wget -qO- http://localhost:3000/health; then
                            echo
                            echo "Deployment is healthy"
                            exit 0
                        fi
                        sleep 2
                    done
                    echo "Health check failed"
                    docker logs ${APP_NAME}
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo "Build #${env.BUILD_NUMBER} deployed. App: http://localhost:${env.HOST_PORT}"
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed. Check the stage logs above."
        }
        always {
            // Remove dangling images left by earlier builds
            sh 'docker image prune -f || true'
        }
    }
}
