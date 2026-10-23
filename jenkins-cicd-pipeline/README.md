# jenkins-cicd-pipeline — Simple Jenkins CI/CD with Docker

A sample Node.js app with a **declarative Jenkins pipeline** (`Jenkinsfile`) that automatically **builds, tests and deploys** it as a Docker container on every code commit.

## Tech stack
Jenkins · Docker · Node.js 22 · GitHub

## Project structure
```
.
├── Jenkinsfile              # The pipeline
├── Dockerfile               # Image for the app
├── jenkins/Dockerfile       # Jenkins image with Docker CLI + Node.js
├── docker-compose.yml       # Runs Jenkins locally
├── src/                     # App code (/ and /health endpoints)
├── test/app.test.js         # Unit tests
└── INTERVIEW_QUESTIONS.md   # Answers to the task's interview questions
```

## Pipeline stages
| Stage | What it does |
|-------|--------------|
| Checkout | Pulls the code from Git |
| Install dependencies | `npm ci` |
| Test | `npm run test:ci` — results published to the Jenkins dashboard (JUnit) |
| Build Docker image | `docker build`, tagged with the build number and `latest` |
| Push to Docker Hub *(optional)* | Runs only if the `PUSH_TO_DOCKERHUB` parameter is ticked |
| Deploy | Replaces the running container and publishes it on port 3000 |
| Verify deployment | Calls `/health` inside the container; fails the build if unhealthy |

If any stage fails, the later stages (including Deploy) do not run.

## 1. Start Jenkins
Requires Docker (Docker Desktop or Docker Engine).
```bash
docker compose up -d --build
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```
Open http://localhost:8080, paste the password, choose **Install suggested plugins**, and create an admin user.

## 2. Create the pipeline job
1. **New Item** → name it `jenkins-cicd-pipeline` → **Pipeline** → OK.
2. Under **Pipeline**, set *Definition* = **Pipeline script from SCM**.
3. *SCM* = **Git**, *Repository URL* = your GitHub repo URL, *Branch* = `*/main`, *Script Path* = `Jenkinsfile`.
4. Save, then click **Build Now** (the first run registers the triggers declared in the Jenkinsfile).

## 3. Trigger on every commit
- **Poll SCM (works on localhost):** already set in the Jenkinsfile (`pollSCM('H/2 * * * *')`), Jenkins checks for new commits every ~2 minutes.
- **GitHub webhook (instant):** in the GitHub repo go to *Settings → Webhooks → Add webhook*, Payload URL `http://<public-jenkins-url>/github-webhook/`, content type `application/json`, event *Just the push event*. For a local Jenkins, expose it with a free tunnel such as ngrok.

## 4. Test it
Change `src/app.js` (e.g. the greeting), commit and push. Watch the build run in the Jenkins dashboard, then:
```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

## Optional: push to Docker Hub
Add a credential in *Manage Jenkins → Credentials → Global → Add Credentials* (type *Username with password*, ID `dockerhub-creds`, password = a Docker Hub access token), then run **Build with Parameters** and tick `PUSH_TO_DOCKERHUB`.

## Run the app without Jenkins
```bash
npm ci && npm test && npm start
# or
docker build -t jenkins-demo-app . && docker run -p 3000:3000 jenkins-demo-app
```

## Notes
- Jenkins runs as root and uses the host's Docker socket (`/var/run/docker.sock`) so it can build and run containers. This is convenient for learning but not recommended for production.
- Deployed containers run on the same Docker host as Jenkins.

## Screenshots
Add screenshots of the successful Jenkins build (Stage View) and the running app in a `screenshots/` folder.
