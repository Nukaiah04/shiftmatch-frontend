pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Using 'checkout scm' automatically reuses the job's git configuration safely
                checkout scm
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
                // Fixed: Changed 'build/**' to 'dist/**' to match Vite's actual output folder
                archiveArtifacts artifacts: 'dist/**'
            }
        }
    } // <-- This closes the STAGES block

    post { 
        success {
            echo 'React build completed successfully 🚀'
        }
        failure {
            echo 'Build failed ❌'
        }
    } // <-- This closes the POST block
} // <-- This closes the PIPELINE block