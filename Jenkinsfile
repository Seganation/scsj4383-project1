// Jenkins declarative pipeline for Archcool (Next.js + Prisma + Docker)
// Triggered by GitHub webhook on push to main/development.
// Builds, lints, packages into Docker image, pushes to Docker Hub.

pipeline {
  agent any

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
  }

  triggers {
    githubPush()
  }

  environment {
    DOCKERHUB_REPO = "noblerawa/archcool"
    IMAGE_TAG      = "${env.BUILD_NUMBER}"
    GIT_SHORT      = "${env.GIT_COMMIT ?: 'dev'}"
    NODE_VERSION   = "22"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git rev-parse --short HEAD > .git_sha && cat .git_sha'
      }
    }

    stage('Setup Node + pnpm') {
      steps {
        sh '''
          node -v || (echo "Node missing on agent" && exit 1)
          corepack enable
          corepack prepare pnpm@9.0.0 --activate
          pnpm -v
        '''
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'pnpm install --frozen-lockfile'
      }
    }

    stage('Lint') {
      steps {
        sh 'pnpm lint'
      }
    }

    stage('Build (Next.js)') {
      steps {
        sh 'pnpm build'
      }
    }

    stage('Docker Build') {
      steps {
        script {
          def shortSha = sh(script: 'cat .git_sha', returnStdout: true).trim()
          sh """
            docker build \\
              --build-arg NEXT_PUBLIC_APP_VERSION=${env.IMAGE_TAG} \\
              --build-arg NEXT_PUBLIC_BUILD_TIME=\$(date -u +%Y-%m-%dT%H:%M:%SZ) \\
              --build-arg NEXT_PUBLIC_COMMIT_SHA=${shortSha} \\
              -t ${DOCKERHUB_REPO}:${IMAGE_TAG} \\
              -t ${DOCKERHUB_REPO}:${shortSha} \\
              -t ${DOCKERHUB_REPO}:latest \\
              .
          """
        }
      }
    }

    stage('Docker Push') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push $DOCKERHUB_REPO:$IMAGE_TAG
            docker push $DOCKERHUB_REPO:latest
            docker push $DOCKERHUB_REPO:$(cat .git_sha)
          '''
        }
      }
    }

    stage('Deploy Trigger (Coolify)') {
      when {
        branch 'main'
      }
      steps {
        withCredentials([string(credentialsId: 'coolify-webhook', variable: 'COOLIFY_HOOK')]) {
          sh 'curl -fsSL -X POST "$COOLIFY_HOOK"'
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
      sh 'docker image prune -f || true'
    }
    success {
      echo "Build ${IMAGE_TAG} pushed: ${DOCKERHUB_REPO}:${IMAGE_TAG}"
    }
    failure {
      echo "Pipeline failed at build ${IMAGE_TAG}"
    }
  }
}
