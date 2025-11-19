# Feature Demonstration Guide

This guide provides examples and demonstrations of all new features added to the SDLC Automation Demo.

## Quick Start

```bash
# Start the server
npm start

# Server runs on http://localhost:3000
```

## 🎯 Feature 1: Task Management System

### Basic Task Operations

#### Create a Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication to the API",
    "status": "todo",
    "priority": "high",
    "assignee": "Backend Team",
    "tags": ["security", "backend"],
    "dueDate": "2025-12-31T23:59:59Z"
  }'
```

#### List All Tasks
```bash
curl http://localhost:3000/api/tasks
```

#### Filter Tasks by Status
```bash
# Get all in-progress tasks
curl http://localhost:3000/api/tasks?status=in-progress

# Get all high-priority tasks
curl http://localhost:3000/api/tasks?priority=high

# Get all tasks assigned to John
curl http://localhost:3000/api/tasks?assignee=John
```

#### Search Tasks
```bash
# Search for tasks containing "monitoring"
curl "http://localhost:3000/api/tasks?search=monitoring"
```

#### Update a Task
```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done",
    "priority": "high"
  }'
```

#### Delete a Task
```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

#### Get Task Statistics
```bash
curl http://localhost:3000/api/tasks/stats/summary | jq
```

### Real-World Workflow Example

```bash
# Sprint Planning: Create tasks for new feature
echo "Creating sprint tasks..."

# Task 1: Design
curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design API for payment gateway",
    "description": "Create OpenAPI specification",
    "status": "todo",
    "priority": "high",
    "assignee": "Architecture Team",
    "tags": ["design", "api"]
  }' | jq -r '.data.id'

# Task 2: Implementation
curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement payment gateway integration",
    "description": "Integrate with Stripe API",
    "status": "todo",
    "priority": "high",
    "assignee": "Backend Team",
    "tags": ["implementation", "backend"]
  }' | jq -r '.data.id'

# Task 3: Testing
curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write integration tests for payments",
    "description": "Cover success and failure scenarios",
    "status": "todo",
    "priority": "medium",
    "assignee": "QA Team",
    "tags": ["testing", "qa"]
  }' | jq -r '.data.id'

# Check sprint statistics
echo "Sprint statistics:"
curl -s http://localhost:3000/api/tasks/stats/summary | jq '.data'
```

## 🚦 Feature 2: Rate Limiting

### Check Your Rate Limit
```bash
# Make a request and check headers
curl -I http://localhost:3000/api/status

# Look for these headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 1732012860
```

### Test Rate Limiting
```bash
# Make multiple rapid requests
echo "Testing rate limiting..."
for i in {1..10}; do
  response=$(curl -s -I http://localhost:3000/api/status)
  remaining=$(echo "$response" | grep -i "x-ratelimit-remaining" | cut -d: -f2 | tr -d ' \r')
  echo "Request $i - Remaining: $remaining"
  sleep 0.1
done
```

### Monitor Rate Limit Status
```bash
# Check current rate limit status
curl -s http://localhost:3000/api/analytics | jq '.data.rateLimitStatus'
```

### Handling Rate Limit Errors
```bash
# When you exceed the limit, you'll get:
# HTTP/1.1 429 Too Many Requests
# Retry-After: 45
# X-RateLimit-Remaining: 0

# Example response:
# {
#   "error": {
#     "message": "Too many requests from this IP, please try again later",
#     "status": 429,
#     "timestamp": "2025-11-19T09:00:00.000Z"
#   }
# }
```

## 📊 Feature 3: API Analytics

### View Complete Analytics
```bash
curl http://localhost:3000/api/analytics | jq
```

### Quick Analytics Summary
```bash
curl http://localhost:3000/api/analytics/summary | jq
```

Example output:
```json
{
  "data": {
    "currentMetrics": {
      "totalRequests": 1523,
      "avgResponseTime": 12,
      "successRate": "98.50",
      "errorRate": "1.50"
    },
    "lastHour": {
      "requests": 245,
      "avgResponseTime": 10,
      "topPaths": [
        { "path": "/api/users", "count": 89 },
        { "path": "/api/tasks", "count": 67 }
      ]
    },
    "rateLimiting": {
      "activeClients": 15,
      "totalRecords": 15
    }
  }
}
```

### Performance Monitoring
```bash
# Check response times
curl http://localhost:3000/api/analytics/performance | jq
```

### HTTP Method Distribution
```bash
# See which methods are used most
curl http://localhost:3000/api/analytics/methods | jq
```

### Status Code Analysis
```bash
# Monitor success and error rates
curl http://localhost:3000/api/analytics/status-codes | jq
```

### Real-Time Monitoring Script
```bash
#!/bin/bash
# monitor.sh - Real-time API monitoring

echo "Starting API monitoring..."
while true; do
  clear
  echo "=== API Analytics Dashboard ==="
  echo ""
  
  # Get summary
  summary=$(curl -s http://localhost:3000/api/analytics/summary)
  
  # Extract metrics
  total=$(echo "$summary" | jq -r '.data.currentMetrics.totalRequests')
  avg_time=$(echo "$summary" | jq -r '.data.currentMetrics.avgResponseTime')
  success_rate=$(echo "$summary" | jq -r '.data.currentMetrics.successRate')
  error_rate=$(echo "$summary" | jq -r '.data.currentMetrics.errorRate')
  
  echo "Total Requests: $total"
  echo "Avg Response Time: ${avg_time}ms"
  echo "Success Rate: ${success_rate}%"
  echo "Error Rate: ${error_rate}%"
  echo ""
  
  echo "Top Endpoints (Last Hour):"
  echo "$summary" | jq -r '.data.lastHour.topPaths[] | "  \(.path): \(.count) requests"'
  
  sleep 5
done
```

## 🔄 Integration Examples

### Build a Task Dashboard
```javascript
// fetch-tasks.js
async function buildTaskDashboard() {
  // Fetch all tasks
  const tasksResponse = await fetch('http://localhost:3000/api/tasks');
  const tasks = await tasksResponse.json();
  
  // Fetch statistics
  const statsResponse = await fetch('http://localhost:3000/api/tasks/stats/summary');
  const stats = await statsResponse.json();
  
  console.log('📋 Task Dashboard');
  console.log('================');
  console.log(`Total Tasks: ${stats.data.total}`);
  console.log(`Todo: ${stats.data.byStatus.todo}`);
  console.log(`In Progress: ${stats.data.byStatus.inProgress}`);
  console.log(`Done: ${stats.data.byStatus.done}`);
  console.log('');
  
  console.log('High Priority Tasks:');
  tasks.data
    .filter(t => t.priority === 'high')
    .forEach(t => console.log(`  - ${t.title} [${t.status}]`));
}

// Run with: node fetch-tasks.js
buildTaskDashboard();
```

### Monitor API Health
```javascript
// health-check.js
async function monitorHealth() {
  const analytics = await fetch('http://localhost:3000/api/analytics/summary');
  const data = await analytics.json();
  
  const errorRate = parseFloat(data.data.currentMetrics.errorRate);
  const avgResponseTime = data.data.currentMetrics.avgResponseTime;
  
  // Alert if error rate is high
  if (errorRate > 5.0) {
    console.error(`⚠️  HIGH ERROR RATE: ${errorRate}%`);
    // Send alert to Slack, PagerDuty, etc.
  }
  
  // Alert if response time is slow
  if (avgResponseTime > 100) {
    console.warn(`⚠️  SLOW RESPONSE TIME: ${avgResponseTime}ms`);
  }
  
  console.log('✅ API health check passed');
}

// Run with: node health-check.js
monitorHealth();
```

### Automated Testing
```bash
#!/bin/bash
# test-features.sh - Automated feature testing

echo "Testing new features..."

# Test 1: Create task
echo "1. Creating task..."
task_id=$(curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Testing API"}' \
  | jq -r '.data.id')
echo "   Created task ID: $task_id"

# Test 2: Get task
echo "2. Getting task..."
curl -s http://localhost:3000/api/tasks/$task_id | jq -r '.data.title'

# Test 3: Update task
echo "3. Updating task..."
curl -s -X PUT http://localhost:3000/api/tasks/$task_id \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}' | jq -r '.message'

# Test 4: Check analytics
echo "4. Checking analytics..."
curl -s http://localhost:3000/api/analytics/summary | jq -r '.data.currentMetrics.totalRequests'

# Test 5: Check rate limits
echo "5. Checking rate limits..."
curl -s -I http://localhost:3000/api/status | grep -i "x-ratelimit"

echo ""
echo "✅ All tests completed!"
```

## 🎓 Learning Exercises

### Exercise 1: Task Management Workflow
1. Create 5 tasks with different priorities
2. Filter to show only high-priority tasks
3. Update one task to "in-progress"
4. Check statistics
5. Complete (status=done) all high-priority tasks
6. Check statistics again

### Exercise 2: Rate Limit Testing
1. Write a script that makes 100 requests
2. Monitor the X-RateLimit-Remaining header
3. Observe what happens at request 101
4. Wait for the window to reset
5. Try again

### Exercise 3: Analytics Dashboard
1. Make various API requests (GET, POST, PUT, DELETE)
2. Check the analytics summary
3. View top endpoints
4. Check performance metrics
5. Verify success/error rates

## 📈 Performance Tips

### Optimize Request Patterns
```bash
# Bad: Making individual requests
for id in 1 2 3 4 5; do
  curl http://localhost:3000/api/tasks/$id
done

# Good: Use filtering to get multiple at once
curl "http://localhost:3000/api/tasks?status=todo"
```

### Monitor Your Rate Limits
```bash
# Always check remaining requests
response=$(curl -s -I http://localhost:3000/api/status)
remaining=$(echo "$response" | grep "X-RateLimit-Remaining" | cut -d: -f2)
if [ "$remaining" -lt 10 ]; then
  echo "⚠️  Warning: Only $remaining requests remaining!"
fi
```

### Use Analytics to Identify Issues
```bash
# Check for slow endpoints
curl -s http://localhost:3000/api/analytics/performance | \
  jq '.data.all | select(.avgResponseTime > 50)'

# Check error rates
curl -s http://localhost:3000/api/analytics/status-codes | \
  jq -r '.data.errorRate'
```

## 🚀 Production Deployment

### Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Analytics
ANALYTICS_MAX_RECORDS=1000
```

### Monitoring Setup
```bash
# Use analytics for monitoring
while true; do
  curl -s http://localhost:3000/api/analytics/summary | \
    jq '{
      requests: .data.currentMetrics.totalRequests,
      success_rate: .data.currentMetrics.successRate,
      avg_time: .data.currentMetrics.avgResponseTime
    }' >> monitoring.log
  sleep 60
done
```

## 📚 Additional Resources

- [NEW_FEATURES.md](NEW_FEATURES.md) - Detailed feature documentation
- [README.md](README.md) - Project overview and setup
- API documentation at `/api/status` endpoint
- Test files in `src/routes/*.test.ts` for code examples

---

For questions or issues, please refer to the documentation or create an issue in the repository.
