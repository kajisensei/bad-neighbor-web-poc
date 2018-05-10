pipeline {
  agent {
    docker {
      image 'node:carbon'
    }

  }
  stages {
    stage('npm') {
      steps {
        sh 'npm install'
      }
    }
    stage('build') {
      parallel {
        stage('bower') {
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
    stage('package') {
      steps {
        sh 'apt-get install zip'
        sh 'zip -r dist.zip .'
        archiveArtifacts 'dist.zip'
      }
    }
  }
}