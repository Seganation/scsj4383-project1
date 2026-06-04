# Project 1 — Part A: Application of DevOps
**Subject:** SCSJ4383 / SCJ4383 — Software Construction  
**Semester:** II 2021/2022  
**Application:** Archcool — Commercial Kitchen Equipment E-Commerce Platform  
**Repository:** https://github.com/Seganation/scsj4383-project1  
**Docker Hub:** https://hub.docker.com/r/rawadararadha/archcool

---

## Executive Summary

This report documents the complete DevOps pipeline for the Archcool web application. The pipeline integrates **Jira** (project management), **GitHub** (source control), **Jenkins** (CI/CD automation), **JMeter** (performance testing), and **Docker** (containerisation) into a unified workflow. Every code push to the `main` branch triggers an automated sequence: lint → build → performance test → Docker image creation → Docker Hub push → Jira issue update.

---

## 1. Jira Project Account Setup

### 1.1 Project Creation

- **Platform:** Jira Software Cloud (atlassian.net)
- **Project name:** Archcool
- **Project key:** `ARCH`
- **Project type:** Scrum
- **URL:** `https://uniq-team-u87tsq5m.atlassian.net/jira/software/projects/ARCH`

### 1.2 Team Collaboration

Team members and the course instructor were invited as collaborators:

| Role | Access Level |
|---|---|
| Project Lead (student) | Admin |
| Team Members | Developer |
| Course Instructor | Viewer / Collaborator |

**Steps to invite:**
1. Open Jira project → **Project Settings** → **Access**
2. Click **Add people** → enter email → select role
3. Click **Send invitation**

### 1.3 Issue Types Used

| Type | Description |
|---|---|
| Story | Feature work (e.g., "ARCH-1: Implement Products API") |
| Task | DevOps tasks (e.g., "ARCH-5: Configure Jenkins pipeline") |
| Bug | Defects (e.g., "ARCH-9: Fix auth.ts syntax error") |

### 1.4 Jira–Jenkins Integration

The Jira plugin for Jenkins was installed to enable two-way sync:
- Jenkins automatically comments on Jira issues when a build succeeds or fails
- Issue status is transitioned (e.g., "In Progress" → "In Review") upon successful build
- Integration configured via **Jira Software Cloud** plugin in Jenkins → **Manage Jenkins** → **Configure System** → **Jira Software Cloud Integration**

Commit messages follow the convention `ARCH-XX: description` so the Jenkinsfile can extract the issue key with:
```bash
git log -1 --pretty=%B | grep -oE 'ARCH-[0-9]+'
```

---

## 2. GitHub Repository Setup

### 2.1 Repository Details

| Item | Value |
|---|---|
| Repository | `Seganation/scsj4383-project1` |
| Visibility | Public |
| Default branch | `main` |
| URL | https://github.com/Seganation/scsj4383-project1 |

### 2.2 Collaboration Setup

Team members and the instructor were added as collaborators:
1. GitHub repo → **Settings** → **Collaborators and teams**
2. Click **Add people** → enter GitHub username or email
3. Select role: `Write` (team members) or `Read` (instructor)

### 2.3 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code — triggers full CI/CD pipeline |
| `development` | Active development branch |
| `feature/*` | Individual feature branches, merged via PR |

### 2.4 GitHub Webhook for Jenkins

A webhook was configured to trigger Jenkins on every push:
- **Payload URL:** `http://<jenkins-server>:8080/github-webhook/`
- **Content type:** `application/json`
- **Events:** Just the `push` event
- **Secret:** Stored as Jenkins credential `github-webhook-secret`

---

## 3. Jenkins Setup and Plugin Integration

### 3.1 Jenkins Installation

Jenkins LTS was installed as a Docker container for reproducibility:

```bash
# Pull and run Jenkins LTS
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk17

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Access Jenkins at `http://localhost:8080` and complete the setup wizard.

### 3.2 Plugins Installed

Navigate to **Manage Jenkins** → **Plugins** → **Available plugins** and install:

| Plugin | Purpose |
|---|---|
| **GitHub Integration** | Webhook trigger on push events |
| **Git** | Source checkout |
| **Pipeline** | Declarative pipeline (`Jenkinsfile`) |
| **Docker Pipeline** | Docker build/push within pipeline |
| **Jira** | Two-way Jira sync (comments + transitions) |
| **Jira Software Cloud** | Cloud Jira API integration |
| **Performance** | Publish JMeter `.jtl` reports |
| **HTML Publisher** | Publish JMeter HTML dashboard |
| **Credentials Binding** | Secure secret injection |
| **Timestamper** | Timestamps in build log |
| **NodeJS** | Node.js tool installer |

### 3.3 NodeJS Tool Configuration

1. **Manage Jenkins** → **Tools** → **NodeJS installations**
2. Add installation: Name `Node 22`, version `22.x`, auto-install from nodejs.org
3. Verify pnpm is available via Corepack: the Jenkinsfile calls `corepack enable && corepack prepare pnpm@9.0.0 --activate`

### 3.4 JMeter Installation on Jenkins Agent

```bash
# Install JMeter on Jenkins agent (Ubuntu/Debian)
apt-get update && apt-get install -y jmeter

# Verify
jmeter -v
```

### 3.5 Credentials Configuration

Navigate to **Manage Jenkins** → **Credentials** → **Global** → **Add Credentials**:

| Credential ID | Type | Value |
|---|---|---|
| `dockerhub-creds` | Username + Password | Docker Hub username + access token |
| `github-webhook-secret` | Secret text | GitHub webhook secret |
| `jira-api-token` | Username + Password | Atlassian email + Jira API token |
| `coolify-webhook` | Secret text | Coolify deploy webhook URL (optional) |

---

## 4. Jira Issue → Jenkins Pipeline Integration

### 4.1 Workflow

1. Developer creates a Jira issue (e.g., `ARCH-12: Add products REST API`)
2. Developer creates a branch named after the issue: `feature/ARCH-12-products-api`
3. Commits include the issue key: `ARCH-12: implement GET /api/products with pagination`
4. On merge to `main`, Jenkins pipeline is triggered
5. Jenkins extracts `ARCH-12` from the commit message
6. On build success: Jenkins posts a comment to `ARCH-12` and transitions it to "In Review"
7. On build failure: Jenkins posts a failure comment to `ARCH-12`

### 4.2 Jenkinsfile Jira Stage

```groovy
stage('Update Jira Issue') {
  steps {
    script {
      def issueKey = sh(
        script: "git log -1 --pretty=%B | grep -oE 'ARCH-[0-9]+' | head -1 || echo ''",
        returnStdout: true
      ).trim()

      if (issueKey) {
        jiraComment(
          idOrKey: issueKey,
          site: 'uniq-team-u87tsq5m.atlassian.net',
          body: "Build #${env.BUILD_NUMBER} PASSED. Docker: rawadararadha/archcool:${env.BUILD_NUMBER}"
        )
        jiraTransitionIssue(
          idOrKey: issueKey,
          site: 'uniq-team-u87tsq5m.atlassian.net',
          input: [transition: [id: '31']] // "In Review"
        )
      }
    }
  }
}
```

---

## 5. GitHub → Jenkins Build Pipeline

### 5.1 Pipeline Overview

Every push to `main` executes the following stages:

```
Checkout → Setup Node/pnpm → Install Dependencies → Lint → Build → JMeter → Docker Build → Docker Push → Jira Update
```

### 5.2 Jenkinsfile Summary

The full `Jenkinsfile` is at the repository root. Key stages:

**Stage 1 — Checkout:**  
Checks out the repository using `checkout scm` and captures the short Git SHA.

**Stage 2 — Setup Node + pnpm:**  
Verifies Node.js presence, enables Corepack, activates pnpm 9.0.0.

**Stage 3 — Install Dependencies:**  
`pnpm install --frozen-lockfile` — deterministic install from the lockfile.

**Stage 4 — Lint:**  
`pnpm lint` — ESLint checks. Fails the build if lint errors exist.

**Stage 5 — Build (Next.js):**  
`pnpm build` — Next.js production build with placeholder environment variables (real secrets not needed at build time).

**Stage 6 — Performance Test (JMeter):**  
`jmeter -n -t jmeter/archcool-perf-test.jmx` — runs against the configured `JMETER_BASE_URL`. Results published as HTML report in Jenkins.

**Stage 7 — Docker Build:**  
Multi-stage Docker build tagging the image with build number, commit SHA, and `latest`.

**Stage 8 — Docker Push:**  
Pushes all three tags to Docker Hub using the `dockerhub-creds` credential.

**Stage 9 — Jira Update:**  
Posts build result comment and transitions the linked Jira issue.

### 5.3 Triggering a Build

```bash
# Push code to trigger pipeline
git add .
git commit -m "ARCH-12: add products REST API with cursor pagination"
git push origin main
```

Jenkins webhook fires within seconds, and the pipeline starts.

---

## 6. JMeter Performance Testing

### 6.1 Test Plan Location

```
jmeter/archcool-perf-test.jmx
```

### 6.2 Test Scenarios

| Thread Group | Endpoint | Threads | Loops | Assertion |
|---|---|---|---|---|
| Products API | `GET /api/health` | 20 | 5 | HTTP 200 |
| Products API | `GET /api/products` | 20 | 5 | HTTP 200 + `items` array present |
| Products API | `GET /api/products?search=grill` | 20 | 5 | HTTP 200 |
| Products API | `GET /api/products?featured=true` | 20 | 5 | HTTP 200 |
| Products API | `GET /api/products/:id` | 20 | 5 | HTTP 200 or 404 |
| Products API | `GET /api/products?category=grills` | 20 | 5 | HTTP 200 |
| Orders API | `GET /api/orders` (no auth) | 5 | 3 | HTTP 401 |

**Performance threshold:** All requests must complete within **3000ms** (enforced by `DurationAssertion`).

### 6.3 Running JMeter Manually

```bash
# Command-line mode (no GUI)
jmeter -n \
  -t jmeter/archcool-perf-test.jmx \
  -Jbase_url=http://localhost:3000 \
  -l jmeter/results/results.jtl \
  -e -o jmeter/results/report/
```

### 6.4 JMeter Report in Jenkins

The Performance plugin reads the `.jtl` file and displays:
- Response time graph (average, 90th percentile)
- Error rate over builds
- Throughput (requests/second)

The HTML Publisher plugin renders the full JMeter dashboard at `jmeter/results/report/index.html`.

---

## 7. Docker Image Build and Push

### 7.1 Dockerfile Architecture (Multi-stage Build)

The `Dockerfile` at the repository root uses three stages:

| Stage | Base Image | Purpose |
|---|---|---|
| `deps` | `node:20-alpine` | Install npm dependencies with pnpm |
| `builder` | `node:20-alpine` | Run `pnpm build` — produces `.next/standalone` |
| `runner` | `node:20-alpine` | Minimal production image |

The final image contains only the compiled Next.js standalone output — no source code, no `node_modules` development dependencies, no secrets.

```dockerfile
# Final stage only: ~250MB vs ~1.5GB full install
FROM base AS runner
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

**Health check** built into the image:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', ...)"
```

### 7.2 Building the Image

```bash
docker build \
  --build-arg NEXT_PUBLIC_APP_VERSION=1.0.0 \
  --build-arg NEXT_PUBLIC_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
  -t rawadararadha/archcool:latest \
  .
```

### 7.3 Tags Applied

| Tag | Description |
|---|---|
| `rawadararadha/archcool:latest` | Most recent build |
| `rawadararadha/archcool:<build-number>` | Jenkins build number (e.g., `:42`) |
| `rawadararadha/archcool:<git-sha>` | Short commit SHA (e.g., `:3e567c3`) |

### 7.4 Pushing to Docker Hub

```bash
# In Jenkins pipeline (automated):
echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
docker push rawadararadha/archcool:latest
docker push rawadararadha/archcool:$BUILD_NUMBER
docker push rawadararadha/archcool:$(cat .git_sha)
```

---

## 8. Team Member Pulls Docker Image

Any team member or the instructor can pull and run the application from Docker Hub without cloning the repository or installing Node.js:

```bash
# Pull the latest image
docker pull rawadararadha/archcool:latest

# Run the container with required environment variables
docker run -d \
  --name archcool \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/archcool" \
  -e BETTER_AUTH_SECRET="your-secret-here" \
  -e STRIPE_SECRET_KEY="sk_test_..." \
  -e STRIPE_WEBHOOK_SECRET="whsec_..." \
  -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." \
  -e UPLOADTHING_TOKEN="eyJ..." \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  rawadararadha/archcool:latest

# Check health
curl http://localhost:3000/api/health
# Expected: {"status":"ok"}

# View logs
docker logs archcool

# Stop
docker stop archcool && docker rm archcool
```

---

## 9. Complete DevOps Flow Diagram

```
Developer pushes commit (ARCH-XX: message)
           │
           ▼
    GitHub Repository
    (Seganation/scsj4383-project1)
           │
           │  webhook
           ▼
    Jenkins Pipeline
    ┌─────────────────────────────────────────────┐
    │  1. Checkout (git clone + SHA)              │
    │  2. Setup Node 22 + pnpm 9                 │
    │  3. pnpm install --frozen-lockfile          │
    │  4. pnpm lint                               │
    │  5. pnpm build                              │
    │  6. jmeter (performance test + report)      │
    │  7. docker build (multi-stage, 3 tags)      │
    │  8. docker push → Docker Hub               │
    │  9. jiraComment + jiraTransitionIssue       │
    └─────────────────────────────────────────────┘
           │                          │
           ▼                          ▼
    Docker Hub                   Jira Issue
    rawadararadha/archcool            ARCH-XX status
    :latest / :42 / :3e567c3     → "In Review"
           │
           ▼
    Team member: docker pull rawadararadha/archcool:latest
```

---

## 10. Evidence Checklist (Screenshots Required in Video)

| # | Evidence Item | Screenshot |
|---|---|---|
| 1 | Jira project board — ARCH-1 to ARCH-5 Done | [view](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtNwerbSTMoBn2alEbgPFGpC9T5Sdqj4LIYAit) |
| 2 | Jira team members (5 members) | [view](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtLv7UC6OZz8EPXpoJ0COBjkvDwFVLUlHINRxf) |
| 3 | Jira space access — all members with roles | [view](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtxqpH33y7qpO2v63MUCW0EZfm5xd9HKgbokPz) |
| 4 | Jira ARCH-1 issue detail | [view](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOt3RGMIG7Tyhd7zQDjxaJeog5p9kVRYL8uNrmW) |
| 5 | Jenkins Build #15 status (SUCCESS) | [view](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOte79GCL5RMbVQgrzdyhu8j7vYqf9NUKn3CxIE) |
| 6 | Jenkins console output (top) | [view](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtHycnM3fTrpM8Wh0RunFbl1mQaGYNftZDiXLj) |
| 7 | Jenkins console output — Finished: SUCCESS | [view](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtUD1RlljBEQbxouklWaFdAD90qZ1VwGHORY74) |
| 8 | Docker Hub — rawadararadha/archcool tags overview | [view](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOttmI7suKcWiIorUPlZ62N4DL1O3XkA9e7RxCt) |
| 9 | Docker Hub — tags :15 and :latest detail | [view](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtkyVL7uHi2oQ3zAK1feM7TWtZbkhOV5NRG0q9) |
| 10 | GitHub collaborators | [view](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtHnL2F7fTrpM8Wh0RunFbl1mQaGYNftZDiXLj) |
| 11 | Team member docker pull + run | *pending — teammate machine required* |

### 10.1 Jenkins Build #15 — Artifacts (JTL file)

The JMeter `.jtl` results file is archived as a Jenkins build artifact.

**How to view:** `http://localhost:8080/job/archcool/15/` -> click **Build Artifacts** in the left sidebar.
The artifact is listed as `jmeter/results/results-15.jtl`. If the sidebar link is not visible, open:
`http://localhost:8080/job/archcool/15/artifact/jmeter/results/results-15.jtl`

> **Note:** Jenkins artifact pages require a live Jenkins session (`http://localhost:8080`) — they are not externally accessible. Start Jenkins with `docker start jenkins` then navigate to the build to view.

---

## Appendix A — Screenshots

### A1. Jenkins Build #15 Status
![Jenkins Build #15 Status](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOte79GCL5RMbVQgrzdyhu8j7vYqf9NUKn3CxIE)

### A2. Jenkins Console Output (top)
![Jenkins Console Output top](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtHycnM3fTrpM8Wh0RunFbl1mQaGYNftZDiXLj)

### A3. Jenkins Console Output — Finished: SUCCESS
![Jenkins Console Finished SUCCESS](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtUD1RlljBEQbxouklWaFdAD90qZ1VwGHORY74)

### A4. Docker Hub — Tags Overview
![Docker Hub tags overview](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOttmI7suKcWiIorUPlZ62N4DL1O3XkA9e7RxCt)

### A5. Docker Hub — Tags :15 and :latest
![Docker Hub tags 15 latest](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtkyVL7uHi2oQ3zAK1feM7TWtZbkhOV5NRG0q9)

### A6. Jira Board — All Issues Done
![Jira Board](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtNwerbSTMoBn2alEbgPFGpC9T5Sdqj4LIYAit)

### A7. Jira Team Members (4)
![Jira Team Members 4](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtaN1bAFecvQkxC2bNzXJyn9ufW3EA8s0BSLRl)

### A8. Jira Team Members (5)
![Jira Team Members 5](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtLv7UC6OZz8EPXpoJ0COBjkvDwFVLUlHINRxf)

### A9. Jira Space Access — Members and Roles
![Jira Space Access](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtxqpH33y7qpO2v63MUCW0EZfm5xd9HKgbokPz)

### A10. Jira ARCH-1 Issue Detail
![Jira ARCH-1](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOt3RGMIG7Tyhd7zQDjxaJeog5p9kVRYL8uNrmW)

### A11. GitHub Collaborators
![GitHub Collaborators](https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtHnL2F7fTrpM8Wh0RunFbl1mQaGYNftZDiXLj)

---

## 11. References

1. Humble, J. & Farley, D. (2010). *Continuous Delivery*. Addison-Wesley.
2. Jenkins Documentation. https://www.jenkins.io/doc/
3. Jira Software Documentation. https://support.atlassian.com/jira-software-cloud/
4. Apache JMeter User Manual. https://jmeter.apache.org/usermanual/
5. Docker Documentation. https://docs.docker.com/
6. Next.js Deployment Documentation. https://nextjs.org/docs/deployment
7. GitHub Webhooks Documentation. https://docs.github.com/en/webhooks
