# 🔄 SDLC Automation Demo

[![CI/CD Pipeline](https://github.com/signanthealth-poc/sdlc-automation-demo/workflows/🔄%20SDLC%20-%20Code%20&%20Build%20Pipeline/badge.svg)](https://github.com/signanthealth-poc/sdlc-automation-demo/actions)
[![Release Pipeline](https://github.com/signanthealth-poc/sdlc-automation-demo/workflows/🚀%20SDLC%20-%20Release%20&%20Deploy%20Pipeline/badge.svg)](https://github.com/signanthealth-poc/sdlc-automation-demo/actions)
[![Monitoring](https://github.com/signanthealth-poc/sdlc-automation-demo/workflows/📊%20SDLC%20-%20Monitoring%20&%20Operations/badge.svg)](https://github.com/signanthealth-poc/sdlc-automation-demo/actions)

A comprehensive demonstration of **Software Development Life Cycle (SDLC) automation** using GitHub Actions, showcasing all phases of modern software development: Plan, Code, Build, Test, Release, Deploy, Operate, and Monitor.

## 🎯 Demo Overview

This project demonstrates a complete SDLC automation pipeline with:

- **📋 Planning**: Issue management, project boards, sprint automation
- **💻 Coding**: Automated code quality checks, security scanning
- **🏗️ Building**: Multi-platform builds, dependency management
- **🧪 Testing**: Unit tests, integration tests, coverage reporting
- **🚀 Releasing**: Automated versioning, release notes, artifact publishing  
- **🌍 Deploying**: Multi-environment deployments, rollback capabilities
- **🔧 Operating**: Health monitoring, performance tracking
- **📊 Monitoring**: Business metrics, incident response, alerting

## 🏗️ Architecture

```
📦 SDLC Automation Demo
├── 🔄 Continuous Integration/Deployment
│   ├── Code Quality Analysis (ESLint, Security Audit)
│   ├── Multi-Node Testing (Node 16, 18, 20)
│   ├── Docker Multi-Platform Builds
│   └── Security Scanning (Trivy, Snyk)
├── 🚀 Release & Deployment
│   ├── Automated Release Creation
│   ├── Staging Environment Deployment  
│   ├── Production Blue-Green Deployment
│   └── Rollback Procedures
├── 📊 Monitoring & Operations
│   ├── Health Monitoring (Uptime, Response Times)
│   ├── Performance Analysis (CPU, Memory, Network)
│   ├── Security Monitoring (Threats, Compliance)
│   └── Business Metrics (Users, Revenue, Satisfaction)
└── 📋 Planning & Management
    ├── Issue Auto-Labeling & Assignment
    ├── Sprint Planning & Reporting
    ├── PR Analysis & Management
    └── Team Performance Metrics
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/sdlc-automation-demo.git
   cd sdlc-automation-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   npm run test:coverage
   npm run test:integration
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Docker

```bash
# Build image
docker build -t sdlc-demo .

# Run container
docker run -p 3000:3000 sdlc-demo
```

## 📋 SDLC Phases Demonstration

### 1. 📋 **Plan Phase**
- **Issue Templates**: Automatically categorize and label issues
- **Project Boards**: Automated sprint planning and tracking
- **Team Metrics**: Performance analytics and recommendations
- **Sprint Reports**: Weekly velocity and completion tracking

**Workflows**: `.github/workflows/planning.yml`

### 2. 💻 **Code Phase**  
- **Code Quality**: ESLint, TypeScript strict mode
- **Security**: Dependency auditing, vulnerability scanning
- **Branch Protection**: Required reviews, status checks
- **Auto-labeling**: PR categorization based on file changes

**Workflows**: `.github/workflows/ci-cd.yml` (Code Quality job)

### 3. 🏗️ **Build Phase**
- **Multi-Platform**: Linux AMD64/ARM64 Docker builds
- **Caching**: Efficient build layer caching
- **Matrix Testing**: Node.js 16, 18, 20 compatibility
- **Artifact Management**: Build artifact storage and distribution

**Workflows**: `.github/workflows/ci-cd.yml` (Build & Docker jobs)

### 4. 🧪 **Test Phase**
- **Unit Tests**: Jest with 80% coverage requirement
- **Integration Tests**: End-to-end API testing
- **Performance Tests**: Load testing with Artillery
- **Security Tests**: Container vulnerability scanning

**Workflows**: `.github/workflows/ci-cd.yml` (Test & Security jobs)

### 5. 🚀 **Release Phase**
- **Semantic Versioning**: Automated tag-based releases
- **Release Notes**: Auto-generated changelogs
- **Asset Publishing**: Docker images, source archives
- **Pre-release Support**: Alpha, beta, RC versions

**Workflows**: `.github/workflows/release-deploy.yml` (Release job)

### 6. 🌍 **Deploy Phase**
- **Multi-Environment**: Staging → Production pipeline
- **Blue-Green Deployment**: Zero-downtime production updates
- **Environment Protection**: Required approvals and reviews
- **Rollback Procedures**: Automated failure recovery

**Workflows**: `.github/workflows/release-deploy.yml` (Deploy jobs)

### 7. 🔧 **Operate Phase**
- **Infrastructure Management**: Container orchestration
- **Configuration Management**: Environment-specific configs
- **Service Management**: Health checks, graceful shutdowns
- **Scaling**: Resource monitoring and auto-scaling triggers

**Workflows**: `.github/workflows/monitoring.yml` (Operations jobs)

### 8. 📊 **Monitor Phase**
- **Application Monitoring**: Response times, error rates, uptime
- **Infrastructure Monitoring**: CPU, memory, disk, network
- **Security Monitoring**: Threat detection, compliance tracking
- **Business Monitoring**: User metrics, revenue, satisfaction

**Workflows**: `.github/workflows/monitoring.yml` (All monitoring jobs)

## 📊 API Endpoints

### Health & Monitoring
- `GET /health` - Comprehensive health status
- `GET /health/live` - Kubernetes liveness probe
- `GET /health/ready` - Kubernetes readiness probe  
- `GET /metrics` - Prometheus metrics

### API Functionality
- `GET /api/status` - API information and endpoints
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user
- `GET /api/error` - Error simulation for testing

### Task Management (NEW)
- `GET /api/tasks` - List all tasks with filtering
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats/summary` - Task statistics

### Analytics & Monitoring (NEW)
- `GET /api/analytics` - Complete API analytics
- `GET /api/analytics/summary` - Quick analytics summary
- `GET /api/analytics/methods` - Statistics by HTTP method
- `GET /api/analytics/status-codes` - Statistics by status code
- `GET /api/analytics/performance` - Performance metrics

See [NEW_FEATURES.md](NEW_FEATURES.md) for detailed documentation.

## 🔧 Configuration

### Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Monitoring
MONITORING_ENABLED=true
ALERT_WEBHOOK=https://hooks.slack.com/webhook

# Database (if using)
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### GitHub Secrets

Required secrets for full automation:

```
GITHUB_TOKEN          # Automatically provided
SNYK_TOKEN            # Security scanning
ALERT_WEBHOOK         # Monitoring alerts
DOCKER_USERNAME       # Container registry
DOCKER_PASSWORD       # Container registry
```

## 🎮 Demo Workflows

### Trigger the Complete SDLC Demo

1. **Plan**: Create an issue with different labels to see auto-categorization
2. **Code**: Create a PR to trigger code quality checks and analysis
3. **Build**: Push to main branch to trigger full CI/CD pipeline
4. **Test**: Watch unit, integration, and performance tests run
5. **Release**: Create a version tag (e.g., `v1.0.0`) to trigger release pipeline
6. **Deploy**: Approve deployment to staging, then production
7. **Operate**: Monitor the health check workflows
8. **Monitor**: Review the daily monitoring reports and metrics

### Manual Workflow Triggers

```bash
# Trigger monitoring
gh workflow run "📊 SDLC - Monitoring & Operations"

# Trigger planning report  
gh workflow run "🔄 SDLC - Planning & Project Management"

# Deploy to specific environment
gh workflow run "🚀 SDLC - Release & Deploy Pipeline" -f environment=staging
```

## 📈 Metrics & Reporting

### Available Reports

- **📊 Daily Operations Summary**: System health, performance, security status
- **🏃 Weekly Sprint Report**: Velocity, completion rates, contributor activity
- **👥 Team Performance**: Contribution metrics, PR analysis, recommendations
- **📈 Business Metrics**: User engagement, revenue, feature usage
- **🚨 Incident Reports**: Automated incident response and tracking

### Dashboards

Access monitoring dashboards at:
- **Health**: `http://localhost:3000/health`
- **Metrics**: `http://localhost:3000/metrics` (Prometheus format)
- **API Status**: `http://localhost:3000/api/status`

## 🛠️ Development

### Project Structure

```
├── .github/workflows/        # GitHub Actions workflows
│   ├── ci-cd.yml            # Code, Build, Test automation
│   ├── release-deploy.yml   # Release & Deploy automation  
│   ├── planning.yml         # Planning & Project management
│   └── monitoring.yml       # Monitoring & Operations
├── src/                     # Application source code
│   ├── routes/              # API route handlers
│   ├── middleware/          # Express middleware
│   ├── utils/               # Utility functions
│   └── test/                # Test files
├── dist/                    # Compiled TypeScript output
├── coverage/                # Test coverage reports
└── logs/                    # Application logs
```

### Adding New Features

1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement feature with tests
3. Create PR - triggers automatic code review
4. Merge after approval - triggers deployment pipeline
5. Monitor feature performance post-deployment

### Customizing Workflows

Each workflow is modular and can be customized:

- **Schedule Changes**: Modify cron expressions in workflow files
- **Environment Configuration**: Update environment variables and secrets
- **Additional Checks**: Add new jobs to existing workflows
- **Custom Metrics**: Extend monitoring with business-specific metrics

## 🏷️ Labels & Issue Management

### Auto-Applied Labels

- **Type**: `bug`, `enhancement`, `documentation`
- **Priority**: `priority: high`, `priority: medium`, `priority: low`  
- **Size**: `size: small`, `size: medium`, `size: large`
- **Status**: `in-progress`, `needs-review`, `blocked`
- **Component**: `ci/cd`, `tests`, `source-code`, `documentation`

### Project Board Automation

Issues automatically move through columns:
- **📥 Backlog** → **🏗️ In Progress** → **👀 Review** → **✅ Done**

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

See auto-generated PR analysis and recommendations in PR comments.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GitHub Actions for powerful CI/CD automation
- Node.js and TypeScript communities
- Docker for containerization
- Prometheus for metrics collection
- Jest for comprehensive testing

---

## 🎯 Next Steps

After exploring this demo:

1. **Customize** workflows for your specific needs
2. **Integrate** with your monitoring and alerting systems  
3. **Extend** with additional SDLC tools and processes
4. **Scale** to handle larger teams and more complex deployments
5. **Evolve** the automation based on your team's feedback and requirements

### New Features Available

This demo now includes:
- ✅ **Task Management System** - Full CRUD operations with filtering and statistics
- ✅ **Rate Limiting** - Protect API from abuse with configurable limits
- ✅ **API Analytics** - Track request patterns, performance, and usage

See [NEW_FEATURES.md](NEW_FEATURES.md) for complete documentation on all new features.

**Happy automating! 🚀**