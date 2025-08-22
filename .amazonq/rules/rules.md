# Amazon Q Context Rules - Actual Budget Custom Deployment

## Project Overview
This is a customized deployment of Actual Budget (open-source personal finance app) on Fly.io, built from source to allow for custom modifications.

## Key Information
- **Original Repo**: Fork of https://github.com/actualbudget/actual
- **Personal Fork**: https://github.com/jonathangonsalves/actual
- **Working Branch**: `custom-flyio-deployment` (never work on `master`)
- **Deployment**: Fly.io app `actual-server-web` in São Paulo region
- **URL**: https://actual-server-web.fly.dev/
- **Cost**: ~$1.50/month

## Git Setup
- `upstream` → Original Actual Budget repo (for updates)
- `origin` → Personal fork (jonathangonsalves/actual)
- **Branch Strategy**: 
  - `master` → Clean upstream tracking (don't modify)
  - `custom-flyio-deployment` → All customizations go here

## Key Files
- `fly.toml` → Fly.io deployment configuration
- `sync-server.Dockerfile` → Multi-stage Docker build
- `update-actual.sh` → Automated update script for new releases
- `check-updates.sh` → Quick update checker
- `test-local.sh` → Local Docker testing
- `DEPLOYMENT.md` → Comprehensive documentation

## Deployment Process
1. Always work on `custom-flyio-deployment` branch
2. Test with `./test-local.sh` (optional)
3. Deploy with `fly deploy`
4. Updates handled by `./update-actual.sh`

## Important Notes
- Uses source-based deployment (not pre-built images)
- Docker layer caching enabled for faster builds
- Persistent volume for budget data
- SSH key setup: uses `github-personal` host for personal account
- Never use GitHub "Sync Fork" button - use local Git commands

## Common Commands
```bash
# Switch to working branch
git checkout custom-flyio-deployment

# Deploy changes
fly deploy

# Check for updates
./check-updates.sh

# Update to latest Actual Budget release
./update-actual.sh

# View logs
fly logs --app actual-server-web --no-tail
```

## Context for AI Assistants
- User has dual GitHub accounts (work: jgonsalves-caylent, personal: jonathangonsalves)
- SSH config uses `github-personal` host for personal repos
- Prefers command-line Git over GitHub web interface
- Experienced developer, appreciates technical details
- Uses macOS, current directory structure maintained
