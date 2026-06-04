# Teammate Docker Pull Screenshot Instructions

Send this file to one teammate. Their job is to prove that another team member can pull and run the Docker image from Docker Hub.

## What We Need Back

Please send these screenshots back:

| # | Screenshot | Must Show |
|---|---|---|
| 1 | Docker pull output | `docker pull rawadararadha/archcool:latest` completed successfully |
| 2 | Running container | `docker ps` showing an `archcool` container running |
| 3 | Browser proof | The app opened from the teammate's machine at `http://localhost:3001` |

If the app page does not fully load because no real production database is connected, that is okay. The most important evidence is that Docker Hub pull works and the image can start on another workstation.

## Requirements

Install Docker Desktop first:

- macOS/Windows: https://www.docker.com/products/docker-desktop/
- Linux: install Docker Engine for your distribution

Then open Terminal, PowerShell, or Command Prompt.

## Step 1 — Pull The Image

Run:

```bash
docker pull rawadararadha/archcool:latest
```

Take screenshot #1 after it finishes. The screenshot should show the image name and successful pull output.

## Step 2 — Run The Container

Run this command exactly:

```bash
docker run -d --name archcool-test -p 3001:3000 \
  -e DATABASE_URL="postgresql://placeholder:x@localhost/x" \
  -e BETTER_AUTH_SECRET="any-32-character-string-here-12345" \
  -e STRIPE_SECRET_KEY="sk_test_placeholder" \
  -e STRIPE_WEBHOOK_SECRET="whsec_placeholder" \
  -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_placeholder" \
  -e UPLOADTHING_TOKEN="placeholder" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3001" \
  rawadararadha/archcool:latest
```

If you are using Windows Command Prompt instead of PowerShell/Git Bash, use this one-line version:

```cmd
docker run -d --name archcool-test -p 3001:3000 -e DATABASE_URL="postgresql://placeholder:x@localhost/x" -e BETTER_AUTH_SECRET="any-32-character-string-here-12345" -e STRIPE_SECRET_KEY="sk_test_placeholder" -e STRIPE_WEBHOOK_SECRET="whsec_placeholder" -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_placeholder" -e UPLOADTHING_TOKEN="placeholder" -e NEXT_PUBLIC_APP_URL="http://localhost:3001" rawadararadha/archcool:latest
```

## Step 3 — Prove It Is Running

Run:

```bash
docker ps
```

Take screenshot #2. It should show:

- Container name: `archcool-test`
- Image: `rawadararadha/archcool:latest`
- Port mapping: `3001->3000`
- Status: `Up`

## Step 4 — Open In Browser

Open:

```text
http://localhost:3001
```

Take screenshot #3 showing the browser URL and the app page or response.

## If The Container Name Already Exists

Run:

```bash
docker rm -f archcool-test
```

Then repeat Step 2.

## If You Need To Stop It Later

Run:

```bash
docker rm -f archcool-test
```

## Send Back

Send the three screenshots to Rawa:

1. Docker pull output
2. `docker ps` running container
3. Browser at `http://localhost:3001`

