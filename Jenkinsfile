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
  }
}