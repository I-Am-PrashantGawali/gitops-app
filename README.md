# gitops-app

Application source code and Kubernetes manifests for the three-tier todo app (React + Node/Express + MongoDB).

```
gitops-app/
├── backend/                  # Node.js/Express API
│   ├── index.js
│   ├── db.js
│   ├── routes/tasks.js
│   ├── models/task.js
│   ├── tests/tasks.test.js   # jest + supertest unit tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # React app
│   ├── src/
│   │   ├── App.js
│   │   ├── App.test.js       # jest + @testing-library tests
│   │   ├── Tasks.js
│   │   └── services/taskServices.js
│   ├── Dockerfile
│   └── package.json
│
├── k8s_manifests/            # ← ArgoCD (three-tier-app) watches this folder
│   ├── namespace.yaml
│   ├── backend-deployment.yaml    ← CI writes the image tag here on each push
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml   ← CI writes the image tag here on each push
│   ├── frontend-service.yaml
│   ├── full_stack_lb.yaml         ← ALB Ingress
│   ├── cluster-secret-store.yaml  ← ESO ClusterSecretStore
│   └── mongo/
│       ├── deploy.yaml
│       ├── service.yaml
│       ├── external-secret.yaml   ← pulls creds from AWS Secrets Manager
│       └── secrets.yaml           ← DEV ONLY fallback, do not apply in prod
│
└── .github/workflows/
    ├── ci-backend.yml         # test → build → push to ECR → update manifest
    ├── ci-frontend.yml        # test → build → push to ECR → update manifest
    └── provision-secrets.yml  # manual: seed MongoDB creds into Secrets Manager
```

## Developer workflow

### Make a code change

```bash
# Change something in backend/ or frontend/
git add .
git commit -m "feat: my change"
git push origin main
```

The CI pipeline:
1. Runs unit tests.
2. Builds a Docker image tagged `v{run_number}-{short_sha}`.
3. Pushes it to ECR.
4. Patches the `image:` line in the matching deployment YAML.
5. Commits the manifest change back to `main` with `[skip ci]`.
6. ArgoCD detects the commit and rolls out the new image to EKS.

### Run tests locally

```bash
# Backend
cd backend && npm ci && npm test

# Frontend
cd frontend && npm ci && CI=true npm test -- --watchAll=false
```

### Change Kubernetes config (not image)

Edit anything in `k8s_manifests/` directly (replicas, env vars, resource limits, etc.),
commit, and push. ArgoCD syncs it within 3 minutes (or instantly via webhook).

## GitHub Secrets required

| Secret | Used by |
|---|---|
| `AWS_ACCESS_KEY_ID` | ECR push |
| `AWS_SECRET_ACCESS_KEY` | ECR push |
| `GIT_PAT` | Commit manifest image tag update back to this repo |
| `MONGO_USERNAME` | Provision Secrets Manager (manual workflow only) |
| `MONGO_PASSWORD` | Provision Secrets Manager (manual workflow only) |

## MongoDB credentials — how they reach the cluster

```
AWS Secrets Manager (gitops/workshop/mongodb)
        │
        │  External Secrets Operator (IRSA → secretsmanager:GetSecretValue)
        ▼
  K8s Secret "mongo-sec"  (namespace: workshop)
        │
        ├─► backend Deployment  (MONGO_USERNAME / MONGO_PASSWORD env vars)
        └─► mongodb Deployment  (MONGO_INITDB_ROOT_USERNAME/PASSWORD env vars)
```

Seed the secret once:
```
GitHub Actions → Actions → Provision AWS Secrets Manager → Run workflow
```
