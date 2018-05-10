pipeline {
  agent {
    docker {
      image 'node:carbon'
    }

  }
  stages {
    stage('npm install') {
      steps {
        sh 'npm install'
      }
    }
    stage('bower install') {
      parallel {
        stage('bower install') {
          steps {
            sh 'bower install --allow-root'
          }
        }
        stage('ls') {
          steps {
            sh 'ls -lh'
          }
        }
      }
    }
    stage('webpack') {
      steps {
        sh 'npm run build'
      }
    }
  }
}