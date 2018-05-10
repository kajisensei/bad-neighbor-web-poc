pipeline {
	agent {
		docker {
			image 'node:carbon'
		}
	}
	
	stages {
		
		stage('clean ?') {
			steps {
				cleanWs()
			}
		}
	
		stage('npm install') {
			steps {
				sh 'npm install'
			}
		}
		
		stage('bower install') {
			steps {
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
