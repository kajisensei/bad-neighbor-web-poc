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
    stage('build') {
      parallel {
        stage('bower install') {
          steps {
            sh 'npm install bower -g'
            sh 'bower install --allow-root'
          }
        }
        stage('webpack') {
          steps {
            sh 'npm run build'
          }
        }
      }
    }
  }
}
