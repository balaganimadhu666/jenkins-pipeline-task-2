# Jenkins controller with the Docker CLI and Node.js installed,
# so pipeline stages can run `npm` and `docker` directly.
FROM jenkins/jenkins:lts-jdk21

USER root

RUN apt-get update \
 && apt-get install -y --no-install-recommends lsb-release ca-certificates curl gnupg \
 # Docker CLI (talks to the host's Docker daemon through the mounted socket)
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
 && chmod a+r /etc/apt/keyrings/docker.asc \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list \
 # Node.js 22
 && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y --no-install-recommends docker-ce-cli nodejs \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Stay root so Jenkins can use /var/run/docker.sock (fine for a local learning setup)
