# Deploy to server on push to main

The workflow **.github/workflows/deploy-to-server.yml** runs on every push to `main`. It SSHs into your server and runs `scripts/pull-build-restart-main.sh` (pull, build, restart).

## Required GitHub repository secrets

Add these in **GitHub → Your repo → Settings → Secrets and variables → Actions**:

| Secret             | Example / description                    |
|--------------------|------------------------------------------|
| `DEPLOY_HOST`      | `18.141.140.150` (your server IP/host)   |
| `DEPLOY_USER`      | `ubuntu` (SSH user on the server)        |
| `SSH_PRIVATE_KEY`  | Contents of your private key file (e.g. `~/.ssh/id_rsa` on the server’s client machine). The matching public key must be in the server’s `~/.ssh/authorized_keys`. |

After saving the secrets, either:

- **Re-run** the latest “Deploy to server” run from the **Actions** tab, or  
- **Push** any commit to `main` to trigger a new deploy.

## Optional

- On the server, `PROJECT_DIR` defaults to `/home/ubuntu/resona.ai`. To override, set the **Actions** variable (or secret) `PROJECT_DIR` in the repo.
