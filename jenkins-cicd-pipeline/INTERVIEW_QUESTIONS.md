# Interview Questions — Task 2

**1. What is Jenkins, and how is it used in CI/CD?**
Jenkins is an open-source automation server. In CI/CD it watches the code repository, and on every commit automatically builds the project, runs tests, packages it (e.g. a Docker image) and deploys it. It has a huge plugin ecosystem (Git, Docker, Pipeline, Kubernetes, etc.) and can scale with distributed build agents.

**2. What is a Jenkinsfile?**
A text file, stored in the project repo, that defines a Jenkins pipeline as code (written in Groovy-based syntax). Keeping it in version control means the pipeline is reviewed, versioned and reproducible like any other code.

**3. How do you create and configure Jenkins pipelines?**
Install Jenkins and the Pipeline/Git plugins → write a `Jenkinsfile` in the repo → in Jenkins create a *Pipeline* job (or *Multibranch Pipeline*) with "Pipeline script from SCM", pointing to the repo, branch and script path → add credentials for secrets → configure a trigger (GitHub webhook or Poll SCM) → run and watch the build in Stage View / Blue Ocean.

**4. What are some common stages in a Jenkins pipeline?**
Checkout → Build/Install dependencies → Test (unit/integration) → Code quality/security scan (e.g. SonarQube) → Package (Docker image/artifact) → Publish (registry/artifact store) → Deploy (staging/production) → Verify/Smoke test → Notify.

**5. What is the difference between a declarative and scripted Jenkins pipeline?**

| | Declarative | Scripted |
|---|---|---|
| Syntax | Structured `pipeline { agent … stages { … } }` | Free-form Groovy: `node { stage('x') { … } }` |
| Learning curve | Easier, opinionated | Steeper, more programming |
| Features | Built-in `post`, `when`, `options`, `parameters`, validation | Maximum flexibility with loops, try/catch, custom logic |
| Best for | Most pipelines (this repo uses it) | Complex dynamic logic |

Scripted example:
```groovy
node {
    stage('Build') { sh 'npm ci' }
    stage('Test')  { sh 'npm test' }
}
```
