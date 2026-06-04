# Manual Steps — What YOU Need To Do
Everything the code can't do for you. Work through this list in order.

---

## ASSIGNMENT 2 (7%) — Frameworks and REST

### Remaining manual steps:

- [ ] **Record the demo video** (< 2 min, .mp4, < 200MB)
  - Show `package.json` → Next.js framework
  - Open `src/app/api/products/route.ts` — explain REST setup
  - Open `src/app/api/orders/route.ts` — explain auth + REST
  - Demo: browse products → search → add to bag → checkout page → my-orders page
  - Use `Cmd+Shift+5` on Mac to record screen

- [ ] **Push code to GitHub**
  ```bash
  git add -A
  git commit -m "feat: fix TypeScript errors, finalize Assignment 2 deliverables"
  git push origin main
  ```

- [ ] **Submit to E-Learning**
  - GitHub link: `https://github.com/Seganation/scsj4383-project1`
  - Upload the `.mp4` video file

---

## PROJECT 1 PART A (10%) — DevOps

Work through these in order. Each step depends on the previous.

### Step 1 — Jira Cloud Setup

- [ ] Go to https://atlassian.com → create free account
- [ ] Create new project: **Scrum**, name it `Archcool`, key `ARCH`
- [ ] Create these issues:
  - `ARCH-1: Setup Jenkins CI/CD pipeline`
  - `ARCH-2: Configure Docker containerisation`
  - `ARCH-3: Setup JMeter performance testing`
  - `ARCH-4: Integrate Jira with Jenkins`
  - `ARCH-5: Push Docker image to Docker Hub`
- [ ] Invite team members: **Project Settings** → **Access** → **Add people**
- [ ] Invite instructor with their email, role: `Viewer`
- [ ] Screenshot: Jira board showing all issues + team members

### Step 2 — GitHub Collaborators

- [ ] Go to https://github.com/Seganation/scsj4383-project1
- [ ] **Settings** → **Collaborators and teams** → **Add people**
- [ ] Add team member GitHub usernames (role: `Write`)
- [ ] Add instructor GitHub username (role: `Read`)
- [ ] Screenshot: collaborators list page

### Step 3 — Docker Hub Account

- [ ] Create account at https://hub.docker.com (username: `noblerawa`)
- [ ] Create repository: `noblerawa/archcool` (public)
- [ ] Generate access token: **Account Settings** → **Security** → **New Access Token**
- [ ] Save the token — you'll need it for Jenkins

### Step 4 — Install Jenkins (Docker)

Run this on your machine:

```bash
# Create Jenkins volume
docker volume create jenkins_home

# Run Jenkins (with Docker socket for docker-in-docker)
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

- [ ] Open http://localhost:8080
- [ ] Enter the initial admin password
- [ ] Click "Install suggested plugins"
- [ ] Create admin user

### Step 5 — Install Jenkins Plugins

Go to **Manage Jenkins** → **Plugins** → **Available plugins**, search and install each:

- [ ] `GitHub Integration Plugin`
- [ ] `Docker Pipeline`
- [ ] `Jira` (by Atlassian)
- [ ] `Jira Software Cloud`
- [ ] `Performance` (for JMeter reports)
- [ ] `HTML Publisher`
- [ ] `NodeJS Plugin`
- [ ] Restart Jenkins after installing

### Step 6 — Configure Jenkins Credentials

**Manage Jenkins** → **Credentials** → **System** → **Global credentials** → **Add Credentials**

- [ ] Add Docker Hub credentials:
  - Kind: `Username with password`
  - ID: `dockerhub-creds`
  - Username: `noblerawa`
  - Password: your Docker Hub access token

- [ ] Add Jira credentials:
  - Kind: `Username with password`
  - ID: `jira-api-token`
  - Username: your Atlassian account email
  - Password: Jira API token (from https://id.atlassian.com/manage-profile/security/api-tokens)

### Step 7 — Configure Jenkins → Jira Integration

**Manage Jenkins** → **Configure System** → find **Jira Software Cloud** section:

- [ ] Site name: `archcool.atlassian.net`
- [ ] Credentials: select `jira-api-token`
- [ ] Test connection → should show "Success"

### Step 8 — Configure Jenkins → GitHub Webhook

- [ ] In Jenkins: **Manage Jenkins** → **Configure System** → **GitHub** → **Add GitHub Server**
  - API URL: `https://api.github.com`
  - Credentials: add a GitHub Personal Access Token (Settings → Developer settings → PAT → Classic → `repo` + `admin:repo_hook` scopes)

- [ ] In GitHub repo: **Settings** → **Webhooks** → **Add webhook**
  - Payload URL: `http://<your-ip>:8080/github-webhook/`
  - Content type: `application/json`
  - Events: **Just the push event**
  - Active: ✅

> **Note:** For local Jenkins to receive GitHub webhooks, you need your machine to be publicly accessible. Use [ngrok](https://ngrok.com): `ngrok http 8080` and use the ngrok URL as the webhook payload URL.

### Step 9 — Install JMeter on Jenkins Agent

```bash
# SSH into Jenkins container or run on the agent machine
docker exec -it --user root jenkins bash
apt-get update && apt-get install -y jmeter
jmeter -v  # verify
```

### Step 10 — Create Jenkins Pipeline

- [ ] New Item → name: `archcool` → type: **Pipeline**
- [ ] Under **Pipeline** → **Definition**: select `Pipeline script from SCM`
- [ ] SCM: `Git`
- [ ] Repository URL: `https://github.com/Seganation/scsj4383-project1`
- [ ] Credentials: add your GitHub PAT if repo is private
- [ ] Branch: `*/main`
- [ ] Script Path: `Jenkinsfile`
- [ ] Save

### Step 11 — Trigger First Build

- [ ] In Jenkins: click your pipeline → **Build Now**
- [ ] Watch **Console Output** — wait for all stages to pass
- [ ] Screenshot: green pipeline with all stages
- [ ] Screenshot: JMeter Performance Report tab in the build
- [ ] Check Docker Hub — image should appear as `noblerawa/archcool:1`

### Step 12 — Verify Jira Update

- [ ] Go to Jira → open one of your issues (e.g., `ARCH-1`)
- [ ] Scroll to **Activity** → should see Jenkins comment
- [ ] Screenshot: Jira issue with Jenkins comment

### Step 13 — Team Member Docker Pull

On a **different machine** (or ask a team member):

```bash
docker pull noblerawa/archcool:latest
docker run -d \
  --name archcool-test \
  -p 3000:3000 \
  -e DATABASE_URL="<connection-string>" \
  -e BETTER_AUTH_SECRET="any-32-char-string" \
  -e STRIPE_SECRET_KEY="sk_test_placeholder" \
  -e STRIPE_WEBHOOK_SECRET="whsec_placeholder" \
  -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_placeholder" \
  -e UPLOADTHING_TOKEN="placeholder" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  noblerawa/archcool:latest
```

- [ ] Screenshot: `docker pull` output
- [ ] Screenshot: `docker ps` showing container running
- [ ] Screenshot: browser showing app at `http://localhost:3000`

### Step 14 — Record the Part A Video

Record your screen showing all 8 steps from the assignment brief:

1. Jira project board + team members
2. GitHub repo + collaborators
3. Jenkins with all plugins installed
4. Jira issue linked to Jenkins build (comment visible)
5. Jenkins console output showing full build
6. Jenkins JMeter report tab
7. Docker Hub showing the pushed image
8. Team member machine: `docker pull` + app running

---

## PROJECT 1 PART B (5%) — Code Smells

### Already done (code):
- [x] Found 4 code smells in `src/app/actions.ts`
- [x] Refactored all 4 smells
- [x] TypeScript compiles with 0 errors after refactor
- [x] Written full report: `docs/PROJECT1_PART_B_CODE_SMELLS_REPORT.md`

### Remaining manual steps:

- [ ] **Convert report to PDF** — open `docs/PROJECT1_PART_B_CODE_SMELLS_REPORT.md` in a markdown viewer (Typora, VS Code + markdown PDF extension, or paste into https://md2pdf.netlify.app), export to PDF

- [ ] **Submit to E-Learning**:
  - PDF documentation
  - GitHub link: `https://github.com/Seganation/scsj4383-project1`

---

## Access You Need to Give Me (optional automations)

If you want me to automate more:

| Service | What For | How to Provide |
|---|---|---|
| Docker Hub | Auto-push images from CI | Already in Jenkinsfile as `noblerawa/archcool` |
| Jira | Auto-create issues, transitions | Share Jira API token + site URL |
| Jenkins | Trigger builds, view logs | Share Jenkins URL + API token |

For anything else (Jira issue creation, Jenkins job config), you can either do it manually using this guide or share credentials and I'll handle it.

---

## Quick Reference: Files Created for This Assignment

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage Docker build for Next.js |
| `Jenkinsfile` | Full CI/CD pipeline (lint → build → JMeter → Docker → Jira) |
| `jmeter/archcool-perf-test.jmx` | JMeter test plan for Products + Orders APIs |
| `docs/ASSIGNMENT2_REPORT.md` | Assignment 2 submission (Framework + REST) |
| `docs/PROJECT1_PART_A_DEVOPS_REPORT.md` | Project 1 Part A full DevOps report |
| `docs/PROJECT1_PART_B_CODE_SMELLS_REPORT.md` | Project 1 Part B code smells + refactoring |
| `docs/MANUAL_STEPS.md` | This file |
| `src/app/actions.ts` | Refactored (4 code smells fixed) |
