# Deployment Guide

This guide covers deploying SaaS-POS to production environments.

## Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (for K8s deployment)
- PostgreSQL 16.x database
- Redis 7.x (for queue features)
- Domain with SSL certificate
- Stripe account (for payments)

## Environment Preparation

### 1. Generate Secrets

```bash
# Generate JWT secret (minimum 32 characters)
openssl rand -base64 32

# Generate refresh token secret
openssl rand -base64 32
```

### 2. Database Setup

```sql
-- Create database
CREATE DATABASE saas_pos;

-- Create user with limited privileges
CREATE USER saas_pos_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE saas_pos TO saas_pos_user;
```

### 3. Run Migrations

```bash
# Set production environment variables
export NODE_ENV=production
export DB_HOST=your-db-host
export DB_PASSWORD=your-password

# Run migrations
cd apps/api
npm run migration:run
```

## Docker Deployment

### Build Images

```bash
# Build production images
docker build -t saas-pos-api:latest -f apps/api/Dockerfile .
docker build -t saas-pos-web:latest -f apps/web/Dockerfile .

# Tag for registry
docker tag saas-pos-api:latest your-registry.com/saas-pos-api:latest
docker tag saas-pos-web:latest your-registry.com/saas-pos-web:latest

# Push to registry
docker push your-registry.com/saas-pos-api:latest
docker push your-registry.com/saas-pos-web:latest
```

### Deploy with Docker Compose

```bash
# Create .env file with production values
cat > .env << EOF
NODE_ENV=production
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=saas_pos_user
DB_PASSWORD=your-secure-password
DB_DATABASE=saas_pos
DB_SSL=true
JWT_SECRET=your-32-char-secret
STRIPE_SECRET_KEY=sk_live_...
CORS_ORIGINS=https://pos.yourdomain.com
EOF

# Deploy
docker-compose -f docker-compose.yml up -d
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace saas-pos
kubectl config set-context --current --namespace=saas-pos
```

### 2. Create Secrets

```bash
# Create database secret
kubectl create secret generic saas-pos-db-secret \
  --from-literal=host=your-db-host.com \
  --from-literal=username=postgres \
  --from-literal=password=your-password \
  --from-literal=database=saas_pos

# Create application secrets
kubectl create secret generic saas-pos-secrets \
  --from-literal=jwt-secret=your-jwt-secret \
  --from-literal=stripe-secret-key=sk_live_...

# Create registry secret (for private registry)
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=your-username \
  --docker-password=your-token
```

### 3. Apply Manifests

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or apply individually
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# View logs
kubectl logs -f deployment/saas-pos-api
```

## SSL/TLS Configuration

### Using cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## Monitoring Setup

### Prometheus Metrics (Optional)

Add to your API deployment:

```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3000"
  prometheus.io/path: "/metrics"
```

### Health Checks

The API exposes these health endpoints:

- `GET /api/v1/health` - Basic health
- `GET /api/v1/health/ready` - Readiness (with DB check)
- `GET /api/v1/health/live` - Liveness

## Scaling

### Horizontal Pod Autoscaler

The HPA is configured to:
- Scale between 2-10 replicas
- Scale up at 70% CPU utilization
- Scale up at 80% memory utilization

```bash
# Check HPA status
kubectl get hpa

# Manual scaling
kubectl scale deployment saas-pos-api --replicas=5
```

## Backup & Recovery

### Database Backup

```bash
# Backup
pg_dump -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE > backup_$(date +%Y%m%d).sql

# Restore
psql -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE < backup_20240123.sql
```

### Redis Backup

```bash
# Trigger backup
redis-cli BGSAVE

# Copy RDB file
kubectl cp saas-pos/redis-pod:/data/dump.rdb ./redis-backup.rdb
```

## Rollback

```bash
# View rollout history
kubectl rollout history deployment/saas-pos-api

# Rollback to previous version
kubectl rollout undo deployment/saas-pos-api

# Rollback to specific revision
kubectl rollout undo deployment/saas-pos-api --to-revision=2
```

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DB_HOST, DB_PORT, DB_PASSWORD
   - Verify network connectivity
   - Check SSL settings

2. **JWT errors**
   - Ensure JWT_SECRET is at least 32 characters
   - Verify secret is consistent across pods

3. **CORS errors**
   - Update CORS_ORIGINS environment variable
   - Include protocol (https://)

4. **Memory issues**
   - Increase resource limits in K8s
   - Check for memory leaks in logs

### Debug Commands

```bash
# Pod logs
kubectl logs -f pod/saas-pos-api-xxx

# Exec into pod
kubectl exec -it pod/saas-pos-api-xxx -- sh

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp

# Describe pod
kubectl describe pod saas-pos-api-xxx
```

## Performance Tuning

### Database
- Enable connection pooling (configured in app.module.ts)
- Add appropriate indexes
- Consider read replicas for analytics

### Redis
- Set maxmemory limits
- Use appropriate eviction policy
- Consider Redis Cluster for high availability

### API
- Adjust rate limits based on traffic
- Enable response compression
- Use CDN for static assets
