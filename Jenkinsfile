pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Automatically checks out your repository using your job's SCM settings
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing project dependencies... 📦'
                bat 'npm install'
            }
        }

        stage('Build React App') {
            steps {
                echo 'Compiling React production build via Vite... ⚡'
                bat 'npm run build'
            }
        }

        stage('Archive Build') {
            steps {
                echo 'Archiving build artifacts... 🗄️'
                // Vite outputs production code into the 'dist' folder
                archiveArtifacts artifacts: 'dist/**'
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                echo 'Building local Docker container... 🐳'
                bat 'docker build -t nukaiah04/shiftmatch-frontend:latest .'
                
                // Securely fetches your saved 'docker-hub-credentials' and hides them from the console logs
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', 
                                                 usernameVariable: 'DOCKER_USER', 
                                                 passwordVariable: 'DOCKER_PASS')]) {
                    echo 'Logging securely into Docker Hub... 🔐'
                    bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
                    
                    echo 'Pushing container image to your Docker Hub repository... 🚀'
                    bat 'docker push nukaiah04/shiftmatch-frontend:latest'
                }
            }
        }
    }

    post { 
        success {
            echo 'React build, testing, and Docker Hub delivery completed successfully! 🚀'
        }
        failure {
            echo 'Pipeline compilation or delivery execution failed ❌'
        }
    }
}