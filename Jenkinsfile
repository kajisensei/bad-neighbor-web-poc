pipeline {
	agent {
		docker {
			image 'node:carbon'
		}
	}
	stages {
		
		stage('build') {
			steps {
				sh 'npm install'
				sh 'npm install bower -g'
				sh 'bower install --allow-root'
				sh 'npm run build'
			}
		}
		
		stage('package') {
			steps {
				zip zipFile: 'package.zip', archive: true
			}
		}
		
		stage('docker') {
			steps {
				script {
					def customImage = docker.build("kaji/bn-website:${env.BUILD_ID}")
				}
			}
		}
	}
}
