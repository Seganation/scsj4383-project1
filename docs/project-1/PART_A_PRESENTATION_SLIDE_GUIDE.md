# Project 1 Part A Presentation Slide Guide

Use this file to create the required Project 1 Part A presentation slides. The assignment brief requires a presentation slide deck and a video presentation covering items 1-8.

## Core Answer

Yes, the video can be a screen recording of the presentation slides while someone explains them.

Yes, the slides should include screenshots. The assignment asks to show proof of Jira, GitHub, Jenkins, JMeter, Docker Hub, and teammate Docker pull/run. Screenshots are the strongest evidence and should be placed directly inside the slides.

## Slide Design Principles

Use these rules:

- One idea per slide.
- Put the evidence screenshot large enough to read.
- Use short labels, not paragraphs.
- Keep each slide title action-based, for example: "Jira Project Board Created".
- Use consistent layout: title on top, screenshot in the center, 2-3 proof bullets at the side or bottom.
- Do not crowd screenshots. If a screenshot has tiny text, make it full slide.
- Use the same colors throughout: dark text, white background, one accent color.
- Use arrows or callout boxes only where they point to important proof.
- Keep the deck around 10-12 slides so the video stays easy to record.

## Recommended Slide Structure

### Slide 1 — Title

Title:

```text
Project 1 Part A: Application of DevOps
```

Include:

- Course: SCSJ4383 / SCJ4383 Software Construction
- Project: Archcool E-Commerce Platform
- Team members: Rawa Dara, Parwar Yassin, Karoz Rebaz, Aland Fryad
- GitHub link: `https://github.com/Seganation/scsj4383-project1`

### Slide 2 — DevOps Architecture Overview

Show the pipeline flow:

```text
Jira -> GitHub -> Jenkins -> JMeter -> Docker Hub -> Teammate Docker Pull
```

Proof bullets:

- Jira tracks issues using `ARCH-1` to `ARCH-5`
- GitHub stores source code
- Jenkins automates lint, build, test, Docker image, Docker push, and Jira update

### Slide 3 — Jira Project Account And Issues

Screenshot:

- Jira board showing `ARCH-1` to `ARCH-5`

Proof bullets:

- Jira project created: `ARCH`
- Issues created for project tasks
- Issues moved through project workflow

### Slide 4 — Jira Members / Instructor Access

Screenshot:

- Jira Project Settings -> Access / members page

Proof bullets:

- Team members invited
- Instructor invited as viewer/collaborator
- Jira collaboration requirement satisfied

### Slide 5 — GitHub Repository And Collaborators

Screenshot:

- GitHub collaborators/settings access page

Proof bullets:

- Repository: `Seganation/scsj4383-project1`
- Team/instructor invited
- Main branch used for CI/CD

### Slide 6 — Jenkins Pipeline Configuration

Screenshot:

- Jenkins `archcool` job page or Build #24 page

Proof bullets:

- Jenkins job connected to GitHub repository
- Pipeline runs from `Jenkinsfile`
- Latest successful build: `#24`

### Slide 7 — Jenkins Successful Build #24

Screenshot:

- Build #24 status page showing green success

Use this uploaded screenshot:

```text
https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtfJPAigUj0hsmQGNqKWSToyUrEvk57w1Z4unM
```

Proof bullets:

- Build #24 completed successfully
- Pipeline includes lint, build, JMeter, Docker build, Docker push
- Build artifact is visible

### Slide 8 — JMeter Artifact Evidence

Screenshot:

- Build #24 artifacts page showing `results-24.jtl`

Use this uploaded screenshot:

```text
https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtUVzRrOnjBEQbxouklWaFdAD90qZ1VwGHORY7
```

Proof bullets:

- JMeter ran inside Jenkins pipeline
- Results file archived as Jenkins artifact
- Artifact: `jmeter/results/results-24.jtl`

Optional link:

```text
https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtWcTceJ9bdTuhprQJKlM8we7DAjnNfkx5UYX0
```

### Slide 9 — Docker Hub Image

Screenshot:

- Docker Hub repository tags page

Use this current Build #24 screenshot:

```text
https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOt7NsgqvBRUq0iFjEAQpmzwd12xcMyZXNTvnCK
```

Proof bullets:

- Docker image pushed to Docker Hub
- Repository: `rawadararadha/archcool`
- Tags include `latest` and build tag `24`

### Slide 10 — Jira Issue Updated From Jenkins

Screenshot:

- Jira issue page, for example `ARCH-1`, showing activity/comment or issue status

Proof bullets:

- Jenkins extracts Jira issue key from commit message
- Jenkins posts build result or transitions issue
- Jira integration requirement satisfied

### Slide 11 — Teammate Docker Pull And Run

Screenshot:

- Teammate terminal showing `docker pull rawadararadha/archcool:latest`
- Teammate terminal showing `docker ps`
- Teammate browser showing the app running locally

Use these uploaded screenshots:

```text
Docker pull:
https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOt2bZubPp3elSdszaMfthqr4ORJDIv8K1pBU0c

Running container:
https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtMXkUXiaNFJOtgeGox3QfkZSH7aC9qnVAMUKs

Browser app:
https://targ83lmc5.ufs.sh/f/MXvbYT8NFJOtjJnC02w4M6sQhDRB5KAr1ZEauJPH90iSdqvg
```

Proof bullets:

- Another team member pulled the image from Docker Hub
- The image started on another workstation
- Docker distribution requirement satisfied

This slide is ready now that the teammate Docker pull/run screenshots are uploaded.

### Slide 12 — Final Submission Summary

Include:

- GitHub source code link: `https://github.com/Seganation/scsj4383-project1`
- Docker Hub link: `https://hub.docker.com/r/rawadararadha/archcool`
- Jenkins successful build: `#24`
- Jira project: `ARCH`
- Statement: "All Project 1 Part A DevOps integration requirements are completed."

## Video Recording Plan

Record the slides in order. Speak for about 10-15 seconds per slide.

Suggested script flow:

1. Introduce project and repository.
2. Explain the DevOps architecture.
3. Show Jira project and members.
4. Show GitHub repo/collaborators.
5. Show Jenkins Build #24 success.
6. Show JMeter artifact.
7. Show Docker Hub image tags.
8. Show Jira issue integration.
9. Show teammate Docker pull/run evidence.
10. End with GitHub link and submission summary.

## What Must Be In The Final Video

The video must show these eight assignment items:

| # | Required Item | Slide |
|---|---|---|
| 1 | Jira project account and collaborators | Slides 3-4 |
| 2 | GitHub repository and collaborators | Slide 5 |
| 3 | Jenkins plugins/integration with Jira, GitHub, JMeter, Docker | Slides 2, 6-8 |
| 4 | Jira issue updated in Jenkins pipeline | Slide 10 |
| 5 | GitHub push/build run in Jenkins pipeline | Slides 6-7 |
| 6 | JMeter report updated in Jenkins | Slide 8 |
| 7 | Docker image built and pushed to Docker Hub | Slide 9 |
| 8 | Teammate pulls Docker image to workstation | Slide 11 |

## Final Files To Submit For Part A

- Presentation slides for items 1-8
- Video presentation for items 1-8
- GitHub source code link: `https://github.com/Seganation/scsj4383-project1`
