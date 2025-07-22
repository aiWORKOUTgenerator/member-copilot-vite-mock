#!/bin/bash

# Production Deployment Script for AI Service Feature-First Architecture
# Part of Phase 4: Production Configuration

set -euo pipefail

# ===== CONFIGURATION =====
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DOCKER_COMPOSE_FILE="${PROJECT_ROOT}/docker/docker-compose.yml"
ENV_FILE="${PROJECT_ROOT}/.env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="production"
SERVICE_NAME="ai-service"
IMAGE_TAG="latest"
SKIP_TESTS=false
SKIP_BACKUP=false
DRY_RUN=false
ROLLBACK_VERSION=""
HEALTH_CHECK_TIMEOUT=300 # 5 minutes
DEPLOYMENT_STRATEGY="rolling" # rolling, blue-green, recreate

# ===== LOGGING =====
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# ===== HELP FUNCTION =====
show_help() {
    cat << EOF
AI Service Production Deployment Script

Usage: $0 [OPTIONS]

Options:
    -e, --environment ENVIRONMENT    Target environment (default: production)
    -t, --tag TAG                   Docker image tag (default: latest)
    -s, --skip-tests               Skip pre-deployment tests
    -b, --skip-backup              Skip pre-deployment backup
    -d, --dry-run                  Show what would be done without executing
    -r, --rollback VERSION         Rollback to specified version
    -S, --strategy STRATEGY        Deployment strategy: rolling|blue-green|recreate (default: rolling)
    -T, --timeout SECONDS         Health check timeout (default: 300)
    -h, --help                     Show this help message

Examples:
    $0                                          # Standard production deployment
    $0 --tag v1.2.3                           # Deploy specific version
    $0 --dry-run                               # Preview deployment
    $0 --rollback v1.2.2                      # Rollback to previous version
    $0 --strategy blue-green --skip-backup    # Blue-green deployment without backup

EOF
}

# ===== ARGUMENT PARSING =====
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -t|--tag)
                IMAGE_TAG="$2"
                shift 2
                ;;
            -s|--skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            -b|--skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -r|--rollback)
                ROLLBACK_VERSION="$2"
                shift 2
                ;;
            -S|--strategy)
                DEPLOYMENT_STRATEGY="$2"
                shift 2
                ;;
            -T|--timeout)
                HEALTH_CHECK_TIMEOUT="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# ===== VALIDATION FUNCTIONS =====
validate_environment() {
    log "Validating deployment environment..."

    # Check if environment file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
        exit 1
    fi

    # Check required environment variables
    source "$ENV_FILE"
    
    local required_vars=("DB_PASSWORD" "REDIS_PASSWORD" "OPENAI_API_KEY" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable $var is not set"
            exit 1
        fi
    done

    # Check Docker and docker-compose
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        error "docker-compose is not installed or not in PATH"
        exit 1
    fi

    # Check Docker daemon
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
        exit 1
    fi

    log "Environment validation passed ✓"
}

validate_resources() {
    log "Validating system resources..."

    # Check disk space (require at least 5GB free)
    local free_space=$(df / | awk 'NR==2 {print $4}')
    local required_space=5242880 # 5GB in KB

    if [[ $free_space -lt $required_space ]]; then
        error "Insufficient disk space. Required: 5GB, Available: $(( free_space / 1024 / 1024 ))GB"
        exit 1
    fi

    # Check memory (require at least 4GB total)
    local total_memory=$(free -m | awk 'NR==2{print $2}')
    local required_memory=4096 # 4GB in MB

    if [[ $total_memory -lt $required_memory ]]; then
        warn "Low memory detected. Required: 4GB, Available: ${total_memory}MB"
    fi

    log "Resource validation passed ✓"
}

# ===== PRE-DEPLOYMENT FUNCTIONS =====
run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        warn "Skipping pre-deployment tests"
        return 0
    fi

    log "Running pre-deployment tests..."

    if [[ "$DRY_RUN" == true ]]; then
        info "DRY RUN: Would run test suite"
        return 0
    fi

    # Run test suite
    cd "$PROJECT_ROOT"
    
    if ! npm run test:ci; then
        error "Tests failed. Deployment aborted."
        exit 1
    fi

    if ! npm run lint; then
        error "Linting failed. Deployment aborted."
        exit 1
    fi

    if ! npm run type-check; then
        error "Type checking failed. Deployment aborted."
        exit 1
    fi

    log "All tests passed ✓"
}

create_backup() {
    if [[ "$SKIP_BACKUP" == true ]]; then
        warn "Skipping pre-deployment backup"
        return 0
    fi

    log "Creating pre-deployment backup..."

    if [[ "$DRY_RUN" == true ]]; then
        info "DRY RUN: Would create backup"
        return 0
    fi

    local backup_timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_dir="${PROJECT_ROOT}/backups/${backup_timestamp}"
    
    mkdir -p "$backup_dir"

    # Backup database
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_dump -U aiservice aiservice | gzip > "${backup_dir}/database_backup.sql.gz"
    
    # Backup Redis data
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli BGSAVE
    docker cp ai-redis-prod:/data/dump.rdb "${backup_dir}/redis_backup.rdb"

    # Backup application logs
    docker cp ai-service-prod:/app/logs "${backup_dir}/app_logs"

    log "Backup created: $backup_dir ✓"
    echo "$backup_dir" > "${PROJECT_ROOT}/.last_backup"
}

# ===== DEPLOYMENT FUNCTIONS =====
build_image() {
    log "Building application image..."

    if [[ "$DRY_RUN" == true ]]; then
        info "DRY RUN: Would build image ${SERVICE_NAME}:${IMAGE_TAG}"
        return 0
    fi

    cd "$PROJECT_ROOT"
    
    # Build the image
    docker build \
        -f docker/Dockerfile \
        --target production \
        --tag "${SERVICE_NAME}:${IMAGE_TAG}" \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse HEAD)" \
        .

    log "Image built successfully ✓"
}

deploy_rolling() {
    log "Starting rolling deployment..."

    if [[ "$DRY_RUN" == true ]]; then
        info "DRY RUN: Would perform rolling deployment"
        return 0
    fi

    # Update image tag in docker-compose
    sed -i.bak "s|image: ${SERVICE_NAME}:.*|image: ${SERVICE_NAME}:${IMAGE_TAG}|" "$DOCKER_COMPOSE_FILE"

    # Rolling update
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --no-deps --force-recreate ai-service

    log "Rolling deployment completed ✓"
}

deploy_blue_green() {
    log "Starting blue-green deployment..."

    if [[ "$DRY_RUN" == true ]]; then
        info "DRY RUN: Would perform blue-green deployment"
        return 0
    fi

    # Create green environment
    local green_compose="${PROJECT_ROOT}/docker/docker-compose.green.yml"
    cp "$DOCKER_COMPOSE_FILE" "$green_compose"
    
    # Update ports and container names for green environment
    sed -i.bak -e 's/3000:3000/3001:3000/' -e 's/-prod/-green/g' "$green_compose"
    sed -i.bak "s|image: ${SERVICE_NAME}:.*|image: ${SERVICE_NAME}:${IMAGE_TAG}|" "$green_compose"

    # Start green environment
    docker-compose -f "$green_compose" up -d

    # Wait for health check
    wait_for_health "http://localhost:3001/health"

    # Switch traffic (update load balancer)
    update_load_balancer_config "3001"

    # Reload load balancer
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec nginx nginx -s reload

    # Stop blue environment after verification
    sleep 30
    docker-compose -f "$DOCKER_COMPOSE_FILE" stop ai-service

    # Clean up
    rm -f "$green_compose" "${green_compose}.bak"

    log "Blue-green deployment completed ✓"
}

deploy_recreate() {
    log "Starting recreate deployment..."

    if [[ "$DRY_RUN" == true ]]; then
        info "DRY RUN: Would recreate all services"
        return 0
    fi

    # Update image tag
    sed -i.bak "s|image: ${SERVICE_NAME}:.*|image: ${SERVICE_NAME}:${IMAGE_TAG}|" "$DOCKER_COMPOSE_FILE"

    # Stop and recreate
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

    log "Recreate deployment completed ✓"
}

perform_deployment() {
    case "$DEPLOYMENT_STRATEGY" in
        rolling)
            deploy_rolling
            ;;
        blue-green)
            deploy_blue_green
            ;;
        recreate)
            deploy_recreate
            ;;
        *)
            error "Unknown deployment strategy: $DEPLOYMENT_STRATEGY"
            exit 1
            ;;
    esac
}

# ===== HEALTH CHECK FUNCTIONS =====
wait_for_health() {
    local health_url="${1:-http://localhost:3000/health}"
    local timeout="$HEALTH_CHECK_TIMEOUT"
    local elapsed=0

    log "Waiting for service health check..."

    while [[ $elapsed -lt $timeout ]]; do
        if curl -f -s "$health_url" > /dev/null; then
            log "Service is healthy ✓"
            return 0
        fi

        sleep 5
        elapsed=$((elapsed + 5))
        info "Health check attempt $((elapsed / 5))/$(($timeout / 5))"
    done

    error "Health check failed after ${timeout} seconds"
    return 1
}

verify_deployment() {
    log "Verifying deployment..."

    if [[ "$DRY_RUN" == true ]]; then
        info "DRY RUN: Would verify deployment"
        return 0
    fi

    # Check service health
    if ! wait_for_health; then
        error "Deployment verification failed"
        return 1
    fi

    # Run smoke tests
    if ! run_smoke_tests; then
        error "Smoke tests failed"
        return 1
    fi

    log "Deployment verification passed ✓"
}

run_smoke_tests() {
    log "Running smoke tests..."

    local base_url="http://localhost:3000"

    # Test health endpoint
    if ! curl -f -s "${base_url}/health" | grep -q "ok"; then
        error "Health endpoint failed"
        return 1
    fi

    # Test metrics endpoint
    if ! curl -f -s "${base_url}/metrics" > /dev/null; then
        error "Metrics endpoint failed"
        return 1
    fi

    # Test API endpoint
    if ! curl -f -s "${base_url}/api/v1/status" > /dev/null; then
        error "API status endpoint failed"
        return 1
    fi

    log "Smoke tests passed ✓"
}

# ===== ROLLBACK FUNCTIONS =====
perform_rollback() {
    if [[ -z "$ROLLBACK_VERSION" ]]; then
        return 0
    fi

    log "Performing rollback to version: $ROLLBACK_VERSION"

    if [[ "$DRY_RUN" == true ]]; then
        info "DRY RUN: Would rollback to $ROLLBACK_VERSION"
        return 0
    fi

    # Update image tag for rollback
    sed -i.bak "s|image: ${SERVICE_NAME}:.*|image: ${SERVICE_NAME}:${ROLLBACK_VERSION}|" "$DOCKER_COMPOSE_FILE"

    # Deploy the rollback
    deploy_rolling

    if verify_deployment; then
        log "Rollback completed successfully ✓"
    else
        error "Rollback verification failed"
        exit 1
    fi
}

# ===== UTILITY FUNCTIONS =====
update_load_balancer_config() {
    local port="$1"
    local nginx_conf="${PROJECT_ROOT}/docker/nginx/conf.d/default.conf"

    # Update upstream server port
    sed -i.bak "s|server ai-service:3000|server ai-service:${port}|" "$nginx_conf"
}

cleanup() {
    log "Cleaning up old images and containers..."

    if [[ "$DRY_RUN" == true ]]; then
        info "DRY RUN: Would cleanup old resources"
        return 0
    fi

    # Remove old images (keep last 3 versions)
    docker images "${SERVICE_NAME}" --format "table {{.Tag}}\t{{.ID}}" | tail -n +4 | awk '{print $2}' | xargs -r docker rmi

    # Remove unused volumes and networks
    docker system prune -f --volumes

    log "Cleanup completed ✓"
}

send_notification() {
    local status="$1"
    local message="$2"

    # Send Slack notification (if webhook configured)
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi

    # Send email notification (if configured)
    if [[ -n "${NOTIFICATION_EMAIL:-}" ]] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "Deployment $status" "$NOTIFICATION_EMAIL" || true
    fi
}

# ===== MAIN EXECUTION =====
main() {
    log "Starting AI Service deployment..."
    log "Environment: $ENVIRONMENT"
    log "Image Tag: $IMAGE_TAG"
    log "Strategy: $DEPLOYMENT_STRATEGY"

    # Parse command line arguments
    parse_arguments "$@"

    # Validation phase
    validate_environment
    validate_resources

    # Handle rollback
    if [[ -n "$ROLLBACK_VERSION" ]]; then
        perform_rollback
        send_notification "SUCCESS" "Rollback to $ROLLBACK_VERSION completed"
        exit 0
    fi

    # Pre-deployment phase
    run_tests
    create_backup
    build_image

    # Deployment phase
    local deployment_start=$(date +%s)
    
    if perform_deployment && verify_deployment; then
        local deployment_end=$(date +%s)
        local deployment_time=$((deployment_end - deployment_start))
        
        log "Deployment completed successfully in ${deployment_time} seconds ✓"
        send_notification "SUCCESS" "Deployment of $IMAGE_TAG completed in ${deployment_time}s"
        
        # Post-deployment cleanup
        cleanup
        
    else
        error "Deployment failed"
        send_notification "FAILED" "Deployment of $IMAGE_TAG failed"
        
        # Auto-rollback on failure (if not dry run)
        if [[ "$DRY_RUN" == false ]] && [[ -f "${PROJECT_ROOT}/.last_deployment" ]]; then
            local last_version=$(cat "${PROJECT_ROOT}/.last_deployment")
            warn "Attempting automatic rollback to $last_version"
            ROLLBACK_VERSION="$last_version"
            perform_rollback
        fi
        
        exit 1
    fi

    # Record successful deployment
    echo "$IMAGE_TAG" > "${PROJECT_ROOT}/.last_deployment"
    
    log "AI Service deployment process completed! 🎉"
}

# Handle script interruption
trap 'error "Deployment interrupted"; exit 130' INT TERM

# Run main function with all arguments
main "$@" 