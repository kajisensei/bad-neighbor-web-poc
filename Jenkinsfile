node {
	checkout scm

	stage('build') {
		docker.image('node:carbon').inside {
			sh 'npm install'
			sh 'npm install bower -g'
			sh 'bower install --allow-root'
			sh 'npm run build'
		}
	}

	stage('package') {
		zip zipFile: 'package.zip', archive: true
	}

	stage('docker') {
		docker.image('docker:latest').inside {
			docker.build("kaji/bn-website:${env.BUILD_ID}")
		}
	}
}
