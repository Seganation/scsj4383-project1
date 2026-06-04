#!/usr/bin/env bash
# Run this once Jira API token is working.
# Usage: bash scripts/create-jira-issues.sh
# Requires: JIRA_EMAIL and JIRA_API_TOKEN set (loads from .env.tokens if present)

set -e

if [ -f "$(dirname "$0")/../.env.tokens" ]; then
  export $(grep -v '^#' "$(dirname "$0")/../.env.tokens" | xargs)
fi

SITE="${JIRA_SITE:-uniq-team-u87tsq5m.atlassian.net}"
PROJECT="${JIRA_PROJECT_KEY:-ARCH}"
AUTH="$JIRA_EMAIL:$JIRA_API_TOKEN"

echo "Creating Jira issues on $SITE project $PROJECT..."

create_issue() {
  local summary="$1"
  local description="$2"
  curl -s -u "$AUTH" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -X POST \
    "https://$SITE/rest/api/3/issue" \
    -d "{
      \"fields\": {
        \"project\": { \"key\": \"$PROJECT\" },
        \"summary\": \"$summary\",
        \"description\": {
          \"type\": \"doc\", \"version\": 1,
          \"content\": [{ \"type\": \"paragraph\", \"content\": [{ \"type\": \"text\", \"text\": \"$description\" }] }]
        },
        \"issuetype\": { \"name\": \"Task\" }
      }
    }" | python3 -c "import sys,json; r=json.load(sys.stdin); print('Created:', r.get('key','ERROR'), r.get('self',''), r.get('errors',''))"
}

create_issue "Setup Jenkins CI/CD pipeline" "Configure Jenkins declarative pipeline triggered by GitHub webhook on push to main."
create_issue "Configure Docker containerisation" "Multi-stage Docker build and push to Docker Hub registry rawadararadha/archcool."
create_issue "Setup JMeter performance testing" "Create and run JMeter test plan for Products API and Orders API endpoints."
create_issue "Integrate Jira with Jenkins" "Install Jira Software Cloud plugin, configure credentials, auto-comment on build success/failure."
create_issue "Push Docker image to Docker Hub" "Automated docker push of rawadararadha/archcool with build number, SHA, and latest tags."

echo "Done. Check https://$SITE/jira/core/projects/$PROJECT/board"
