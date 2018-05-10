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
				zip zipFile: 'package.zip', archive: true
			}
		}
		
		stage('docker') {
			agent {
				docker {
					image 'docker:latest'
				}
			}
			steps {
				sh 'docker build -t kaji/bn-website:latest .'
			}
		}
	}
}
