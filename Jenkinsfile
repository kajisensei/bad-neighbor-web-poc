pipeline {
	agent none
	stages {
		
		stage('npm') {
			agent {
				docker {
					image 'node:carbon'
				}
			}
			steps {
				sh 'npm install'
			}
		}
		
		stage('build') {
			agent {
				docker {
					image 'node:carbon'
				}
			}
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
			agent any
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
