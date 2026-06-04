// Jenkins declarative pipeline for Archcool (Next.js + Prisma + Docker)
// Triggered by GitHub webhook on push to main/development.
// Stages: Checkout → Install → Lint → Build → JMeter → Docker Build → Docker Push → Jira Update

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
    DOCKERHUB_REPO  = "rawadararadha/archcool"
    IMAGE_TAG       = "${env.BUILD_NUMBER}"
    NODE_VERSION    = "22"
    // Base URL for JMeter performance tests (set to staging or localhost)
    JMETER_BASE_URL = "${env.JMETER_TARGET_URL ?: 'http://localhost:3000'}"
    // Jira project key for issue tracking
    JIRA_PROJECT    = "ARCH"
    JIRA_SITE       = "uniq-team-u87tsq5m.atlassian.net"
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
          node -v
          pnpm -v
        '''
      }
    }

    stage('Install Dependencies') {
      steps {
        sh '''
          pnpm install --frozen-lockfile --network-concurrency 4 --ignore-scripts
          pnpm exec prisma generate
        '''
      }
    }

    stage('Lint') {
      steps {
        sh 'pnpm lint'
      }
    }

    stage('Build (Next.js)') {
      environment {
        DATABASE_URL            = "postgresql://placeholder:placeholder@localhost:5432/placeholder"
        BETTER_AUTH_SECRET      = "build-time-placeholder-secret-min-32-chars-long"
        UPLOADTHING_SECRET      = "sk_placeholder_build_secret"
        STRIPE_SECRET_KEY       = "sk_test_placeholder_build_secret"
        STRIPE_WEBHOOK_SECRET   = "whsec_placeholder_build_secret"
        NEXT_TELEMETRY_DISABLED = "1"
      }
      steps {
        sh 'pnpm build'
      }
    }

    stage('Performance Test (JMeter)') {
      steps {
        script {
          // Run JMeter test plan against the base URL
          // JMeter must be installed on Jenkins agent: apt-get install jmeter
          sh """
            jmeter -n \
              -t jmeter/archcool-perf-test.jmx \
              -Jbase_url=${JMETER_BASE_URL} \
              -l jmeter/results/results-${IMAGE_TAG}.jtl \
              -e -o jmeter/results/report-${IMAGE_TAG} \
              || echo "JMeter test completed with warnings"
          """
        }
      }
      post {
        always {
          // Publish JMeter HTML report in Jenkins using Performance plugin
          perfReport(
            sourceDataFiles: "jmeter/results/results-${IMAGE_TAG}.jtl",
            errorUnstableThreshold: 5,
            errorFailedThreshold: 10
          )
          publishHTML(target: [
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: "jmeter/results/report-${IMAGE_TAG}",
            reportFiles: 'index.html',
            reportName: "JMeter Performance Report - Build ${IMAGE_TAG}"
          ])
        }
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

    stage('Update Jira Issue') {
      steps {
        script {
          def shortSha = sh(script: 'cat .git_sha', returnStdout: true).trim()
          def buildInfo = "Build #${env.IMAGE_TAG} | SHA: ${shortSha} | Docker: ${DOCKERHUB_REPO}:${IMAGE_TAG}"

          // Add comment to Jira issue (Jira plugin must be installed)
          // Issue key extracted from branch name or commit message if following ARCH-XXX convention
          def issueKey = sh(
            script: "git log -1 --pretty=%B | grep -oE '${JIRA_PROJECT}-[0-9]+' | head -1 || echo ''",
            returnStdout: true
          ).trim()

          if (issueKey) {
            jiraComment(
              idOrKey: issueKey,
              site: JIRA_SITE,
              body: "Jenkins Pipeline SUCCESS\n${buildInfo}\nJMeter report available in Jenkins build #${IMAGE_TAG}"
            )
            // Transition issue to "In Review" or "Done"
            jiraTransitionIssue(
              idOrKey: issueKey,
              site: JIRA_SITE,
              input: [transition: [id: '31']] // 31 = "In Review" transition ID (adjust per your workflow)
            )
            echo "Updated Jira issue: ${issueKey}"
          } else {
            echo "No Jira issue key found in commit message — skipping Jira update"
          }
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
      script {
        // Optionally post failure comment to Jira
        def issueKey = sh(
          script: "git log -1 --pretty=%B | grep -oE '${JIRA_PROJECT}-[0-9]+' | head -1 || echo ''",
          returnStdout: true
        ).trim()
        if (issueKey) {
          jiraComment(
            idOrKey: issueKey,
            site: JIRA_SITE,
            body: "Jenkins Pipeline FAILED at build #${IMAGE_TAG}. Check console output for details."
          )
        }
      }
    }
  }
}
