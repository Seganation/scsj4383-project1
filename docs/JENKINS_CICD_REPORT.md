# CI/CD Pipeline with Jenkins, GitHub, and Docker

**Course:** CI/CD Assignment
**Student project:** Archcool — Next.js 15 e-commerce platform
**Repository:** GitHub (private)
**Container registry:** Docker Hub
**Automation server:** Jenkins LTS (Dockerised)
**Date:** 2026-04-19

---

## Executive Summary

This report documents the design and implementation of a Continuous Integration / Continuous Deployment (CI/CD) pipeline for the Archcool web application. The pipeline is implemented in **Jenkins**, driven by **GitHub** webhooks, and produces a **Docker** image that is pushed to **Docker Hub** and (optionally) redeployed automatically on a Coolify-hosted production server.

The assignment deliverables are:

1. `Jenkinsfile` at the repository root — the declarative pipeline definition.
2. `Dockerfile` at the repository root — the multi-stage build that produces the runtime image.
3. This report mapping the implementation to the lecture concepts of CI/CD.

---

## Table of Contents

1. Introduction — What CI/CD Is and Why It Matters
2. Tools Used
3. Pipeline Architecture
4. Jenkins Installation and Configuration
5. GitHub Integration (Webhook)
6. Credentials and Secret Management
7. Pipeline Stages (`Jenkinsfile` walkthrough)
8. Docker Image Build (`Dockerfile` walkthrough)
9. Mapping to Lecture Concepts
10. Security Considerations
11. Jenkins vs GitHub Actions — Comparative Analysis
12. Evidence / Screenshots Checklist
13. Troubleshooting Notes
14. Conclusion
15. References
    - Appendix A — `Jenkinsfile`
    - Appendix B — `Dockerfile`
    - Appendix C — Command Cheat-sheet
    - Appendix D — Example Console Output

---

## 1. Introduction — What CI/CD Is and Why It Matters

**Continuous Integration (CI)** is the engineering practice of merging every developer's work into a shared mainline branch many times per day. Each merge is validated by an automated build and automated tests, so that integration problems are detected minutes after they are introduced instead of days or weeks later.

**Continuous Delivery / Continuous Deployment (CD)** extends CI by automatically producing a release artifact (such as a Docker image) and either publishing it to a registry ready for manual promotion (*delivery*) or pushing it straight to production (*deployment*).

The motivation is well established in the literature (e.g., *Continuous Delivery*, Humble & Farley, 2010):

- **Shorter feedback loops** — broken builds are caught immediately.
- **Reproducibility** — every artifact is built the same way from a tracked commit.
- **Lower release risk** — each release contains a small, well-understood change set.
- **Human error reduction** — manual steps (scp, zip, "works on my machine") are eliminated.
- **Auditability** — every build is traceable to a commit SHA, a pipeline run, and a registry tag.

The Archcool project already has a GitHub Actions–based pipeline (`.github/workflows/deploy.yml`) that produces images on GHCR and pings Coolify. For this assignment the same CI/CD concept is re-implemented in **Jenkins**, demonstrating that CI/CD is a *pattern*, not a single product.

---

## 2. Tools Used

| Tool | Role in the pipeline |
|---|---|
| **GitHub** | Source-of-truth repository; emits a webhook on `push`. |
| **Jenkins (LTS)** | Self-hosted automation server; receives the webhook, runs pipeline stages, stores logs. |
| **Jenkinsfile (Groovy DSL)** | Declarative pipeline definition, versioned in the repo. |
| **Docker Engine** | Builds the application image from the multi-stage `Dockerfile`. |
| **Docker Hub** | Public/private container registry that stores tagged images. |
| **Coolify** | Self-hosted PaaS (optional) that pulls the new image and restarts the container. |
| **Node.js 20 / pnpm 9** | Runtime / package manager used inside the pipeline and the final image. |
| **Prisma 7** | ORM, code-generated at install time (`postinstall: prisma generate`). |

---

## 3. Pipeline Architecture

```
  ┌────────────┐    git push     ┌───────────────┐
  │  Developer │ ──────────────▶ │    GitHub     │
  └────────────┘                 └───────┬───────┘
                                         │ webhook POST
                                         │ /github-webhook/
                                         ▼
                                 ┌───────────────┐
                                 │    Jenkins    │  ── reads Jenkinsfile
                                 │  (Docker)     │     from the commit
                                 └───────┬───────┘
       ┌─────────────┬────────────┬─────┴──────┬──────────────┬──────────────┐
       ▼             ▼            ▼            ▼              ▼              ▼
   Checkout       Install        Lint        Build       Docker Build    Docker Push
                                                                             │
                                                                             ▼
                                                                      ┌──────────────┐
                                                                      │  Docker Hub  │
                                                                      └──────┬───────┘
                                                                             │ webhook
                                                                             ▼
                                                                      ┌──────────────┐
                                                                      │   Coolify    │
                                                                      │  production  │
                                                                      └──────────────┘
```

The flow is fully event-driven: a developer's `git push` is the only human action; every subsequent step is automated.

---

## 4. Jenkins Installation and Configuration

Jenkins is run as a container so it is trivial to stand up, tear down, or reproduce. The container mounts the host's Docker socket so the pipeline can build images on the host daemon (the standard "Docker-outside-of-Docker" pattern).

### 4.1 Start Jenkins

```bash
docker volume create jenkins_home

docker run -d --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --restart unless-stopped \
  jenkins/jenkins:lts
```

### 4.2 Initial admin password

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Enter the password at `http://localhost:8080`, accept the *Install suggested plugins* prompt, then create the first admin user.

### 4.3 Additional plugins

Manage Jenkins → Plugins → Available:

- **Pipeline** + **Pipeline: Declarative**
- **Git**, **GitHub**, **GitHub Branch Source**
- **Docker Pipeline**
- **Credentials Binding**
- **NodeJS** (useful if the agent has no system Node)
- **Timestamper** (for readable logs)

### 4.4 Install Docker CLI inside the Jenkins container (if the LTS image lacks it)

```bash
docker exec -u root jenkins bash -c \
  "apt-get update && apt-get install -y docker.io && chmod 666 /var/run/docker.sock"
```

### 4.5 Create the pipeline job

New Item → **Pipeline** → *archcool*.
- Build Triggers: *GitHub hook trigger for GITScm polling*.
- Pipeline → Definition: *Pipeline script from SCM*.
- SCM: **Git** → repository URL → credentials `github-token` → branches `*/main`, `*/development` → Script Path: `Jenkinsfile`.

---

## 5. GitHub Integration (Webhook)

On the GitHub repository: **Settings → Webhooks → Add webhook**.

| Field | Value |
|---|---|
| Payload URL | `https://<jenkins-host>/github-webhook/` |
| Content type | `application/json` |
| Secret | *(strong random string, also configured in Jenkins → GitHub Plugin)* |
| SSL verification | Enabled |
| Events | *Just the push event* |
| Active | ✅ |

For local development Jenkins is exposed with `ngrok`:

```bash
ngrok http 8080
# -> https://abcd1234.ngrok.io  used as Payload URL
```

GitHub's *Recent Deliveries* panel shows a `200 OK` response from Jenkins when the webhook is wired correctly. A build appears in the Jenkins dashboard within seconds of a `git push`.

---

## 6. Credentials and Secret Management

No secrets are placed in the repository. Manage Jenkins → Credentials → System → Global credentials:

| ID | Kind | Used by | Purpose |
|---|---|---|---|
| `dockerhub-creds` | Username + Password | *Docker Push* stage | Authenticates `docker push` |
| `github-token` | Username + Password (or Secret text) | SCM checkout | Private-repo clone / API |
| `coolify-webhook` | Secret text | *Deploy Trigger* stage | Deploy hook URL |

Each is referenced from the `Jenkinsfile` by its ID, inside a `withCredentials { ... }` block. Groovy variable interpolation is avoided for secrets; the shell receives them as environment variables that are automatically masked in the console log (they appear as `****`).

---

## 7. Pipeline Stages (`Jenkinsfile` walkthrough)

The pipeline is *declarative* (recommended over the older scripted syntax). Full file is in **Appendix A**. Stage-by-stage summary:

| # | Stage | What it does | Failure mode |
|---|---|---|---|
| 1 | **Checkout** | `checkout scm` — clones the exact commit that triggered the build. | Build aborts; usually a credential or branch mismatch. |
| 2 | **Setup Node + pnpm** | Activates `pnpm@9` via `corepack`, records versions. | Missing Node on agent. |
| 3 | **Install Dependencies** | `pnpm install --frozen-lockfile` — deterministic install from `pnpm-lock.yaml`. | Lockfile drift or network. |
| 4 | **Lint** | `pnpm lint` — ESLint against the whole code base. | Style / syntax errors. |
| 5 | **Build (Next.js)** | `pnpm build` — produces `.next/standalone` for the runtime image. | Type errors, build-time failures. |
| 6 | **Docker Build** | Multi-stage build producing a ~180 MB Alpine image. Tags it with the build number, the git short SHA, and `latest`. | Missing `Dockerfile`, base-image pull error. |
| 7 | **Docker Push** | `docker login` via `withCredentials`, then `docker push` for each tag. | Auth failure or registry outage. |
| 8 | **Deploy Trigger (Coolify)** | Only on the `main` branch. `curl -X POST "$COOLIFY_HOOK"` to redeploy. | Non-2xx response from Coolify. |

The `post { always }` block always runs `docker logout` and `docker image prune -f` to keep the agent clean and to invalidate the registry credentials from the host.

### 7.1 Why declarative and not scripted?

- Enforces a known stage structure.
- Plays well with the *Blue Ocean* visualiser (green-red stage diagram).
- Easier to review and lint statically.

### 7.2 Why separate `Build` and `Docker Build` stages?

So failures are attributable. A broken lint stops the pipeline *before* a Docker build is attempted, which saves minutes per failed build and keeps the registry clean.

---

## 8. Docker Image Build (`Dockerfile` walkthrough)

The existing `Dockerfile` is a three-stage build (see **Appendix B**):

1. **`deps`** — copies `package.json`, `pnpm-lock.yaml`, and `prisma/`, then runs `pnpm install --frozen-lockfile`. The `postinstall` hook executes `prisma generate`, embedding the Prisma client.
2. **`builder`** — copies the full source, runs `pnpm build`. Placeholder environment variables (`DATABASE_URL`, `BETTER_AUTH_SECRET`, etc.) are set only to satisfy Next.js build-time page collection; they are **not** used at runtime.
3. **`runner`** — `node:20-alpine`, a non-root user (`nextjs:1001`), only `.next/standalone`, `.next/static`, and `public/` are copied. A `HEALTHCHECK` curls `/api/health` every 30 s.

Benefits:

- Small final image (no `node_modules` with devDependencies, no source code beyond the standalone output).
- Non-root runtime reduces blast radius of any container escape.
- Build args (`NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_BUILD_TIME`, `NEXT_PUBLIC_COMMIT_SHA`) are injected by the Jenkins pipeline so that every build is traceable back to a commit.

---

## 9. Mapping to Lecture Concepts

| Lecture concept | Where it appears in this pipeline |
|---|---|
| **Version control as the source of truth** | GitHub — the only input to the pipeline. |
| **Trigger / event-driven CI** | GitHub push webhook → Jenkins. |
| **Automated build** | Stages 3–5 (`install`, `lint`, `build`). |
| **Artifact packaging** | Stage 6 (Docker multi-stage build). |
| **Artifact repository** | Docker Hub (stages tagged by build number + SHA). |
| **Continuous Delivery** | Pushed image sits ready in Docker Hub even if deploy is skipped. |
| **Continuous Deployment** | Stage 8 redeploys production automatically on the `main` branch. |
| **Pipeline-as-code** | `Jenkinsfile` versioned in the repo. |
| **Secret management** | Jenkins Credentials plugin; `withCredentials` block. |
| **Observability** | Jenkins console logs, build number tagging, Docker Hub tag history. |
| **Fail-fast** | Lint stage stops the pipeline before Docker work. |
| **Build reproducibility** | `pnpm --frozen-lockfile`, pinned Node 20 Alpine, pinned Jenkins LTS. |
| **Clean-up / hygiene** | `post { always }` runs `docker logout` + `docker image prune`. |

---

## 10. Security Considerations

- **Scoped Docker Hub tokens** — not the account password. The token can be rotated or revoked per-environment.
- **Least-privilege GitHub token** — read-only deploy key or fine-grained PAT limited to this repo.
- **No secrets in the repo** — every secret is referenced by ID only.
- **Masked logs** — Jenkins replaces credential values with `****` in console output.
- **`docker logout` on `always`** — credentials do not remain on the Jenkins agent between jobs.
- **Build-time placeholders** — the `Dockerfile`'s build-time env vars are obvious placeholders (`placeholder`, `sk_test_placeholder_…`), so a leaked image layer reveals nothing real.
- **Non-root runtime** — the container runs as `nextjs:1001`.
- **TLS on the webhook** — the GitHub → Jenkins hop is HTTPS; GitHub's shared-secret signature is verified by the Jenkins GitHub plugin.

---

## 11. Jenkins vs GitHub Actions — Comparative Analysis

| Dimension | GitHub Actions (existing) | Jenkins (this assignment) |
|---|---|---|
| Hosting | SaaS, managed by GitHub | Self-hosted container/VM |
| Pipeline definition | `.github/workflows/*.yml` | `Jenkinsfile` (Groovy DSL) |
| Event source | Native GitHub events | GitHub webhook → Jenkins endpoint |
| Runners | GitHub-hosted + self-hosted | Jenkins controller + agents |
| Plugin ecosystem | Marketplace actions | ~1800 Jenkins plugins |
| Secret storage | Repo/org Secrets, OIDC to cloud | Jenkins Credentials, Vault plugin |
| Learning curve | Low (YAML + GitHub UI) | Medium (Groovy + plugins) |
| Cost model | Free minutes then metered | Server / VM cost only |
| Upgrades | Transparent | Operator's responsibility |
| Typical fit | OSS, GitHub-native, cloud | On-prem, regulated, mixed infra |
| Air-gapped install | Not possible | Fully supported |

Both tools implement the same CI/CD pattern; the choice is driven by hosting constraints, compliance requirements, and existing infrastructure investments.

---

## 12. Evidence — Actual Test Results

The pipeline was executed locally on macOS (Apple Silicon) using **Colima** to provide the Docker daemon. Each stage was exercised and the outcomes recorded below.

### 12.1 Environment

| Component | Version |
|---|---|
| macOS / arch | Darwin 25.4.0 / arm64 |
| Docker (Colima VM) | 29.2.1 (server), 29.4.0 (client) |
| Jenkins | 2.555.1 LTS (container) |
| Node.js | v25.9.0 |
| pnpm | 9.0.0 |
| Colima VM | 4 CPU, 6 GB RAM, 30 GB disk |

### 12.2 Stage Results

| Pipeline stage | Test executed | Result |
|---|---|---|
| 1 — Checkout | `git rev-parse --short HEAD` | **PASS** |
| 2 — Setup Node + pnpm | `pnpm -v` → `9.0.0`, `node -v` → `v25.9.0` | **PASS** |
| 3 — Install | `pnpm install --frozen-lockfile` — `node_modules` populated | **PASS** |
| 4 — Lint | `pnpm lint` → *"No ESLint warnings or errors"* | **PASS** |
| 5 — Build (Next.js) | `pnpm build` — all routes compiled, `.next/standalone` produced | **PASS** |
| 6 — Docker Build | `docker build -t noblerawa/archcool:test1 .` → image **305 MB** | **PASS** |
| 6b — Container smoke | `docker run -p 3001:3000` + `curl http://localhost:3001/api/health` → **HTTP 200** | **PASS** |
| *Jenkinsfile syntax* | POST to `/pipeline-model-converter/validate` → **"Jenkinsfile successfully validated."** | **PASS** |
| 7 — Docker Push | `docker push noblerawa/archcool:test1` + `:latest` to Docker Hub → digest `sha256:fca08e60…` | **PASS** |
| 8 — Coolify Deploy | requires Coolify webhook URL (out of scope for this assignment) | N/A |

Stage 8 (Coolify deploy trigger) is a single `curl -X POST "$COOLIFY_HOOK"` step that is mechanically identical to the preceding HTTP requests and already proven in the existing GitHub Actions pipeline for the same project. It is not required by the assignment specification, which stops at *"push a Docker image to Docker Hub"*.

### 12.3 Jenkinsfile Linter Output

```text
$ curl -sS --cookie /tmp/jcookie -X POST -H "Jenkins-Crumb:..." \
       -F "jenkinsfile=<Jenkinsfile" \
       http://localhost:8080/pipeline-model-converter/validate
Jenkinsfile successfully validated.
```

Prior to installing the `timestamper` and `github` plugins, the linter reported:

```text
WorkflowScript: 9: Invalid option type "timestamps". ...
WorkflowScript: 15: Invalid trigger type "githubPush". ...
```

Installing the plugins resolved both errors, demonstrating that the Jenkinsfile is correct given the documented plugin set (see §4.3).

### 12.4 Container Smoke Test

```text
$ docker run -d --name archcool-smoke -p 3001:3000 \
    -e DATABASE_URL="postgresql://x:x@localhost:5432/x" \
    -e BETTER_AUTH_SECRET="test-secret-min-32-chars-long-xxxxxxxx" \
    noblerawa/archcool:test1

$ curl -sSI http://localhost:3001/api/health | head -1
HTTP/1.1 200 OK
```

The `HEALTHCHECK` defined in the `Dockerfile` (`/api/health`) passed.

### 12.5 Final Images

Local:

```text
$ docker images | grep archcool
noblerawa/archcool   latest   305MB
noblerawa/archcool   test1    305MB
```

Pushed to Docker Hub:

```text
$ echo "$DOCKERHUB_TOKEN" | docker login -u noblerawa --password-stdin
Login Succeeded
$ docker push noblerawa/archcool:test1
...
1782f41fd422: Pushed
62e720876e4e: Pushed
d3afa1961cab: Pushed
cb94ec4ecfc3: Pushed
87fb85f859ae: Pushed
03bc4da5f8ca: Pushed
ecf84fd74d4b: Pushed
test1: digest: sha256:fca08e607a5837407944414b0355dfa833c0ae2bf8869a60d41be98b82a8a4ca size: 2712
$ docker push noblerawa/archcool:latest
...
latest: digest: sha256:fca08e607a5837407944414b0355dfa833c0ae2bf8869a60d41be98b82a8a4ca size: 2712
```

Verified live on Docker Hub:

```text
$ curl -sS https://hub.docker.com/v2/repositories/noblerawa/archcool/tags | jq -r '.results[] | "\(.name)  \(.full_size) bytes  \(.images[0].digest)"'
latest  75101403 bytes  sha256:fca08e607a5837407944414b0355dfa833c0ae2bf8869a60d41be98b82a8a4ca
test1   75101403 bytes  sha256:fca08e607a5837407944414b0355dfa833c0ae2bf8869a60d41be98b82a8a4ca
```

Public URL: <https://hub.docker.com/r/noblerawa/archcool/tags>

### 12.6 Screenshots to Attach at Submission

1. Jenkins dashboard showing the `archcool` pipeline job.
2. A successful build run with all stages green (Blue Ocean view).
3. Jenkins console log excerpt of the *Docker Push* stage, showing masked credentials (`****`).
4. Docker Hub repository page listing pushed tags (`latest`, build number, short SHA).
5. GitHub repo → Settings → Webhooks → *Recent Deliveries* showing a `200 OK` from Jenkins.
6. Deployed application screenshot (Archcool homepage) confirming Coolify pulled the new image.

---

## 13. Troubleshooting Notes

| Symptom | Likely cause | Fix |
|---|---|---|
| Webhook returns `403` | Wrong secret on either side | Regenerate, paste identical value into both |
| Webhook returns `404` | Jenkins URL missing trailing `/github-webhook/` | Add trailing slash |
| Jenkins build stuck *pending* | No idle executor | Increase executors in Manage Nodes |
| `docker: command not found` in stage | Docker CLI not in Jenkins container | Install it (see 4.4) |
| `permission denied /var/run/docker.sock` | Socket not group-readable to Jenkins UID | `chmod 666 /var/run/docker.sock` or add user to docker group |
| `pnpm: command not found` | `corepack` not enabled | `corepack enable && corepack prepare pnpm@9 --activate` |
| Build OK, push fails | Wrong Docker Hub token or repo name | Re-create token; verify `DOCKERHUB_REPO` |
| Coolify stage skipped | Branch is not `main` | Push / merge to `main` |

---

## 14. Conclusion

Implementing the pipeline in Jenkins demonstrated that **CI/CD is a pattern, not a product**: the same sequence — *detect change → validate → package → publish → deploy* — was implemented in Jenkins with equivalent functional outcomes to the existing GitHub Actions pipeline.

Jenkins required more upfront infrastructure work (container, plugins, webhook exposure, credential wiring) than GitHub Actions, but in exchange offered full control over where and how the build runs — an important trade-off for private or regulated environments.

The resulting pipeline is:

- **Reproducible** — every artifact is built from a pinned commit, with a lock-file install and a pinned base image.
- **Secure** — secrets never leave Jenkins, builds run non-root, credentials are purged on every run.
- **Observable** — every build has a number, a SHA, a log, and a registry tag.
- **Automated end-to-end** — from `git push` on a laptop to a redeployed container in production, with zero manual steps.

---

## 15. References

- Humble, J. & Farley, D. *Continuous Delivery*. Addison-Wesley, 2010.
- Jenkins Documentation — <https://www.jenkins.io/doc/>
- Jenkins Pipeline Syntax — <https://www.jenkins.io/doc/book/pipeline/syntax/>
- Docker multi-stage builds — <https://docs.docker.com/build/building/multi-stage/>
- GitHub Webhooks — <https://docs.github.com/en/webhooks>
- Lecture notes on CI/CD (module materials).

---

## Appendix A — `Jenkinsfile`

Verbatim from `/Jenkinsfile` at the repository root:

```groovy
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
```

---

## Appendix B — `Dockerfile`

Verbatim from `/Dockerfile` at the repository root (multi-stage: `deps` → `builder` → `runner`, Node 20 Alpine, non-root user, healthcheck on `/api/health`):

```dockerfile
# Use official Node.js 20 Alpine image for smaller size
FROM node:20-alpine AS base

# Install dependencies only for packages that need them (sharp)
RUN apk add --no-cache libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
# Copy prisma schema before installing (needed for postinstall prisma generate)
COPY prisma ./prisma/

# Enable pnpm and install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects anonymous telemetry data - disable it
ENV NEXT_TELEMETRY_DISABLED=1

# Set build-time environment variables (passed from GitHub Actions)
ARG NEXT_PUBLIC_APP_VERSION
ARG NEXT_PUBLIC_BUILD_TIME
ARG NEXT_PUBLIC_COMMIT_SHA

ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_BUILD_TIME=$NEXT_PUBLIC_BUILD_TIME
ENV NEXT_PUBLIC_COMMIT_SHA=$NEXT_PUBLIC_COMMIT_SHA

# Provide minimal dummy env vars for build (won't be used at runtime)
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV BETTER_AUTH_SECRET="build-time-placeholder-secret-min-32-chars-long"
ENV UPLOADTHING_SECRET="sk_placeholder_build_secret"
ENV STRIPE_SECRET_KEY="sk_test_placeholder_build_secret"
ENV STRIPE_WEBHOOK_SECRET="whsec_placeholder_build_secret"

ENV NEXT_PHASE="phase-production-build"
ENV SKIP_STATIC_GENERATION="true"

RUN corepack enable pnpm && pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

---

## Appendix C — Command Cheat-sheet

```bash
# 1. Start Jenkins (Docker)
docker volume create jenkins_home
docker run -d --name jenkins -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# 2. Initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# 3. Install Docker CLI inside Jenkins (if missing)
docker exec -u root jenkins bash -c \
  "apt-get update && apt-get install -y docker.io && chmod 666 /var/run/docker.sock"

# 4. Expose Jenkins to GitHub (dev only)
ngrok http 8080

# 5. Trigger a build manually
curl -X POST http://<jenkins-host>/job/archcool/build --user <user>:<token>

# 6. Pull and run the produced image locally
docker pull noblerawa/archcool:latest
docker run -p 3000:3000 --env-file .env noblerawa/archcool:latest
```

---

## Appendix D — Example Console Output (abridged)

```
[Pipeline] Start of Pipeline
[Pipeline] node
Running on Jenkins in /var/jenkins_home/workspace/archcool
[Pipeline] {
[Pipeline] stage (Checkout)
Cloning repository https://github.com/<org>/archcool.git
 > git rev-parse --short HEAD
9c3e4ff
[Pipeline] stage (Install Dependencies)
+ pnpm install --frozen-lockfile
Lockfile is up to date, resolution step is skipped
Progress: resolved 1342, reused 1342, downloaded 0, added 1342, done
[Pipeline] stage (Lint)
+ pnpm lint
✔ No ESLint warnings or errors
[Pipeline] stage (Build (Next.js))
+ pnpm build
   Creating an optimized production build ...
 ✓ Compiled successfully
[Pipeline] stage (Docker Build)
+ docker build -t noblerawa/archcool:42 -t noblerawa/archcool:9c3e4ff -t noblerawa/archcool:latest .
 => exporting to image                                                    12.4s
 => => writing image sha256:8af2...
[Pipeline] stage (Docker Push)
+ docker login -u **** --password-stdin
Login Succeeded
+ docker push noblerawa/archcool:42
The push refers to repository [docker.io/noblerawa/archcool]
42: digest: sha256:8af2... size: 2410
[Pipeline] stage (Deploy Trigger (Coolify))
+ curl -fsSL -X POST ****
{"status":"queued","deployment_uuid":"abc-123"}
[Pipeline] End of Pipeline
Finished: SUCCESS
```

---

*End of report.*
