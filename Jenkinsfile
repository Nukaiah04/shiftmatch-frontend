pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stage('Checkout Code') {
    steps {
        git url: 'https://github.com/Nukaiah04/shiftmatch-frontend.git', branch: 'main'
    }
}

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build React App') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Archive Build') {
            steps {
                archiveArtifacts artifacts: 'build/**'
            }
        }
    }

    post {
        success {
            echo 'React build completed successfully 🚀'
        }
        failure {
            echo 'Build failed ❌'
        }
    }
}