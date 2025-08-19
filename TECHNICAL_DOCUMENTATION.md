# Payment Service - Technical Documentation

## Table of Contents
1. [Service Overview](#service-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Installation & Setup](#installation--setup)
5. [Configuration](#configuration)
6. [API Reference](#api-reference)
7. [Deployment Guide](#deployment-guide)
8. [User Manual](#user-manual)
9. [Update Manual](#update-manual)
10. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
11. [Security Considerations](#security-considerations)
12. [Testing](#testing)

## Service Overview

The Payment Service is a microservice responsible for handling all payment-related operations in the NydArt Advisor application. It integrates with multiple payment providers (Stripe and PayPal) to process payments, manage subscriptions, and handle webhooks.

### Key Features
- Stripe payment processing
- PayPal payment integration
- Subscription management
- Payment webhook handling
- Customer management
- Payment validation and security
- Multi-currency support
- Refund processing
- Payment analytics and reporting

### Service Responsibilities
- Payment processing and validation
- Subscription lifecycle management
- Customer payment method management
- Webhook event processing
- Payment security and fraud prevention
- Payment analytics and reporting
- Integration with payment providers
- Error handling and retry logic

## Technology Stack

### Core Technologies
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4.18.2)
- **Payment Providers**: Stripe, PayPal
- **Database**: MongoDB (via Database Service)
- **Validation**: Joi, Express Validator

### Key Dependencies
```json
{
  "express": "^4.18.2",
  "stripe": "^14.7.0",
  "@paypal/checkout-server-sdk": "^1.0.3",
  "mongoose": "^8.16.1",
  "joi": "^17.11.0",
  "express-validator": "^7.0.1",
  "helmet": "^7.1.0",
  "winston": "^3.11.0",
  "compression": "^1.7.4",
  "express-rate-limit": "^7.1.5"
}
```

### Development Tools
- **Testing**: Mocha, Chai, Sinon, Supertest, Jest
- **Code Coverage**: NYC
- **Development Server**: Nodemon
- **Environment Management**: dotenv
- **Code Quality**: ESLint, Prettier

## Architecture

### Service Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │ Payment Service │    │   Stripe API    │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (Payment)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   PayPal API    │
                       │   (Payment)     │
                       └─────────────────┘
```

### Payment Flow
1. **Payment Initiation**: Frontend creates payment intent → Payment Service validates → Provider API call
2. **Payment Processing**: Provider processes payment → Webhook notification → Payment Service updates status
3. **Subscription Management**: User subscribes → Payment Service creates subscription → Recurring billing setup
4. **Webhook Handling**: Provider sends webhook → Payment Service validates → Database update → Notification

### Data Models

#### Payment Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  amount: Number,
  currency: String,
  status: String,
  provider: String,
  providerPaymentId: String,
  paymentMethod: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

#### Subscription Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  planId: String,
  status: String,
  provider: String,
  providerSubscriptionId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: Boolean,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

#### Customer Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  provider: String,
  providerCustomerId: String,
  email: String,
  paymentMethods: Array,
  defaultPaymentMethod: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Stripe account and API keys
- PayPal account and API credentials
- MongoDB (local or Atlas)

### Installation Steps

1. **Clone and Navigate**
   ```bash
   cd payment_service
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your payment provider credentials
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

### Payment Provider Setup

#### Stripe Setup
1. **Create Stripe Account**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Create account and verify email
   - Complete business verification

2. **Get API Keys**
   - Navigate to Developers → API Keys
   - Copy Publishable Key and Secret Key
   - Add to `.env` file

3. **Configure Webhooks**
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.

#### PayPal Setup
1. **Create PayPal Developer Account**
   - Go to [PayPal Developer](https://developer.paypal.com/)
   - Create account and verify email

2. **Create App**
   - Navigate to My Apps & Credentials
   - Create new app
   - Get Client ID and Secret

3. **Configure Webhooks**
   - Go to Webhooks section
   - Add endpoint: `https://yourdomain.com/api/webhooks/paypal`
   - Select events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, etc.

## Configuration

### Environment Variables

Create a `.env` file in the `payment_service` directory:

```env
# Server Configuration
PORT=3004
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox

# Database Configuration
DATABASE_URL=your_database_connection_string_here

# Service URLs
FRONTEND_URL=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:5002
DB_SERVICE_URL=http://localhost:5001
NOTIFICATION_SERVICE_URL=http://localhost:5006

# Logging
LOG_LEVEL=info
LOG_FILE=logs/payment-service.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
TRUST_PROXY=1
HELMET_ENABLED=true

# Payment Configuration
DEFAULT_CURRENCY=USD
SUPPORTED_CURRENCIES=USD,EUR,GBP,CAD,AUD
MIN_PAYMENT_AMOUNT=0.50
MAX_PAYMENT_AMOUNT=10000.00

# Subscription Configuration
SUBSCRIPTION_PLANS=basic,premium,enterprise
TRIAL_PERIOD_DAYS=7
GRACE_PERIOD_DAYS=3
```

### Critical Configuration Notes

#### Stripe Configuration
- **STRIPE_SECRET_KEY**: Use test key for development, live key for production
- **STRIPE_WEBHOOK_SECRET**: Required for webhook signature verification
- **STRIPE_PUBLISHABLE_KEY**: Used by frontend for payment elements

#### PayPal Configuration
- **PAYPAL_MODE**: Use `sandbox` for development, `live` for production
- **PAYPAL_CLIENT_ID/SECRET**: Different credentials for sandbox and live

#### Security Configuration
- **JWT_SECRET**: Strong secret for inter-service communication
- **TRUST_PROXY**: Enable for production behind reverse proxy
- **HELMET_ENABLED**: Security headers for production

## API Reference

### Payment Endpoints

#### POST /api/payments/create-payment-intent
Create a payment intent for processing payments.

**Request Body:**
```json
{
  "amount": 2999,
  "currency": "usd",
  "paymentMethod": "card",
  "metadata": {
    "userId": "user_id",
    "description": "Premium subscription"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 2999,
    "currency": "usd",
    "status": "requires_payment_method"
  }
}
```

#### POST /api/payments/confirm-payment
Confirm a payment after user provides payment method.

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": "pm_xxx"
}
```

#### GET /api/payments/:id
Get payment details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment_id",
    "amount": 2999,
    "currency": "usd",
    "status": "succeeded",
    "provider": "stripe",
    "providerPaymentId": "pi_xxx",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Subscription Endpoints

#### POST /api/subscriptions/create
Create a new subscription.

**Request Body:**
```json
{
  "userId": "user_id",
  "planId": "premium",
  "paymentMethodId": "pm_xxx",
  "trialPeriodDays": 7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_xxx",
    "status": "active",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "planId": "premium"
  }
}
```

#### GET /api/subscriptions/:id
Get subscription details.

#### PUT /api/subscriptions/:id/cancel
Cancel a subscription.

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "subscriptionId": "sub_xxx",
    "status": "canceled",
    "cancelAtPeriodEnd": true
  }
}
```

### Customer Endpoints

#### POST /api/customers/create
Create a new customer.

**Request Body:**
```json
{
  "userId": "user_id",
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### GET /api/customers/:id
Get customer details.

#### PUT /api/customers/:id/payment-methods
Update customer payment methods.

### Webhook Endpoints

#### POST /api/webhooks/stripe
Handle Stripe webhook events.

**Headers:** Stripe-Signature: t=timestamp,v1=signature

#### POST /api/webhooks/paypal
Handle PayPal webhook events.

### Health Check Endpoints

#### GET /health
Service health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "payment-service",
  "version": "1.0.0",
  "providers": {
    "stripe": "connected",
    "paypal": "connected"
  }
}
```

## Deployment Guide

### Production Deployment

#### 1. Environment Preparation
```bash
# Set production environment
NODE_ENV=production

# Update payment provider credentials for production
STRIPE_SECRET_KEY=sk_live_your_production_stripe_secret_key
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your_production_paypal_client_id
PAYPAL_CLIENT_SECRET=your_production_paypal_client_secret
```

#### 2. Security Configuration
```env
# Production security settings
JWT_SECRET=your-production-jwt-secret-32-chars-minimum
TRUST_PROXY=1
HELMET_ENABLED=true
CORS_ORIGIN=https://yourdomain.com

# Production webhook secrets
STRIPE_WEBHOOK_SECRET=whsec_your_production_stripe_webhook_secret
PAYPAL_WEBHOOK_ID=your_production_paypal_webhook_id
```

#### 3. Deployment Options

**Option A: Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3004
CMD ["npm", "start"]
```

**Option B: Direct Deployment**
```bash
# Install dependencies
npm ci --only=production

# Start service
npm start
```

**Option C: PM2 Deployment**
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start src/server.js --name "payment-service"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 4. Reverse Proxy Configuration (Nginx)
```nginx
server {
    listen 80;
    server_name payments.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Webhook Configuration

#### Stripe Webhook Setup
1. **Production Webhook**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://payments.yourdomain.com/api/webhooks/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Get Webhook Secret**
   - Copy webhook signing secret
   - Add to production environment: `STRIPE_WEBHOOK_SECRET`

#### PayPal Webhook Setup
1. **Production Webhook**
   - Go to PayPal Developer Dashboard → Webhooks
   - Add endpoint: `https://payments.yourdomain.com/api/webhooks/paypal`
   - Select events:
     - `PAYMENT.CAPTURE.COMPLETED`
     - `PAYMENT.CAPTURE.DENIED`
     - `BILLING.SUBSCRIPTION.CREATED`
     - `BILLING.SUBSCRIPTION.ACTIVATED`
     - `BILLING.SUBSCRIPTION.CANCELLED`

2. **Get Webhook ID**
   - Copy webhook ID
   - Add to production environment: `PAYPAL_WEBHOOK_ID`

## User Manual

### For Developers

#### Starting the Service
```bash
# Development mode
npm run dev

# Production mode
npm start
```

#### Testing the Service
```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:performance

# Run Jest tests
npm run test:jest
```

#### API Testing
```bash
# Test payment intent creation
curl -X POST http://localhost:3004/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"amount": 2999, "currency": "usd"}'

# Test health endpoint
curl http://localhost:3004/health

# Test webhook endpoint (with Stripe signature)
curl -X POST http://localhost:3004/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=timestamp,v1=signature" \
  -d '{"type": "payment_intent.succeeded", "data": {...}}'
```

#### Payment Provider Testing
```bash
# Test Stripe connectivity
curl -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  https://api.stripe.com/v1/payment_intents

# Test PayPal connectivity
curl -H "Authorization: Bearer $PAYPAL_ACCESS_TOKEN" \
  https://api-m.paypal.com/v1/payments/payment
```

### For System Administrators

#### Service Management
```bash
# Check service status
pm2 status

# Restart service
pm2 restart payment-service

# View logs
pm2 logs payment-service

# Monitor resources
pm2 monit
```

#### Payment Provider Monitoring
```bash
# Check Stripe dashboard
# Go to: https://dashboard.stripe.com/

# Check PayPal dashboard
# Go to: https://developer.paypal.com/dashboard/

# Monitor webhook deliveries
# Check webhook logs in provider dashboards
```

#### Database Management
```bash
# Check payment records
mongo art_advisor --eval "db.payments.find().pretty()"

# Check subscription records
mongo art_advisor --eval "db.subscriptions.find().pretty()"

# Check customer records
mongo art_advisor --eval "db.customers.find().pretty()"
```

## Update Manual

### Version Update Process

#### 1. Pre-Update Checklist
- [ ] Backup current configuration
- [ ] Review changelog and breaking changes
- [ ] Test in staging environment
- [ ] Verify payment provider integrations
- [ ] Notify stakeholders of maintenance window

#### 2. Update Steps
```bash
# 1. Stop service
pm2 stop payment-service

# 2. Backup current version
cp -r /app/payment-service /app/payment-service-backup-$(date +%Y%m%d)

# 3. Pull latest code
git pull origin main

# 4. Install dependencies
npm ci --only=production

# 5. Run migrations (if any)
npm run migrate

# 6. Start service
pm2 start payment-service

# 7. Verify health
curl http://localhost:3004/health
```

#### 3. Rollback Procedure
```bash
# If update fails, rollback
pm2 stop payment-service
rm -rf /app/payment-service
mv /app/payment-service-backup-$(date +%Y%m%d) /app/payment-service
pm2 start payment-service
```

#### 4. Post-Update Verification
- [ ] Health check passes
- [ ] Payment provider connectivity verified
- [ ] Webhook endpoints functional
- [ ] Payment processing works
- [ ] Logs show no errors

### Configuration Updates

#### Environment Variable Changes
```bash
# Edit environment file
nano .env

# Reload environment
pm2 reload payment-service

# Verify changes
curl http://localhost:3004/health
```

#### Payment Provider Updates
1. Update API keys if needed
2. Verify webhook configurations
3. Test payment processing
4. Restart service: `pm2 restart payment-service`
5. Monitor for any issues

## Monitoring & Troubleshooting

### Health Monitoring

#### Key Metrics to Monitor
- **Response Time**: < 2s for payment operations
- **Error Rate**: < 1% for all endpoints
- **Uptime**: > 99.9%
- **Payment Success Rate**: > 95%
- **Webhook Delivery Rate**: > 99%
- **Memory Usage**: < 80% of allocated memory

#### Monitoring Commands
```bash
# Check service health
curl http://localhost:3004/health

# Monitor memory usage
pm2 monit

# Check payment provider status
curl -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  https://api.stripe.com/v1/account
```

### Common Issues & Solutions

#### 1. Payment Provider API Errors
**Symptoms**: 401, 403, or 500 errors from payment providers
**Causes**: Invalid API keys, rate limiting, account issues
**Solutions**:
```bash
# Check API keys
echo $STRIPE_SECRET_KEY
echo $PAYPAL_CLIENT_ID

# Test API connectivity
curl -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  https://api.stripe.com/v1/account

# Check account status in provider dashboards
```

#### 2. Webhook Delivery Failures
**Symptoms**: Webhook events not being processed
**Causes**: Incorrect webhook URLs, signature verification failures
**Solutions**:
```bash
# Check webhook configuration
grep WEBHOOK .env

# Verify webhook endpoints are accessible
curl -I https://payments.yourdomain.com/api/webhooks/stripe

# Check webhook logs
pm2 logs payment-service | grep webhook
```

#### 3. Payment Processing Errors
**Symptoms**: Payment failures, declined transactions
**Causes**: Invalid payment methods, insufficient funds, fraud detection
**Solutions**:
```bash
# Check payment logs
pm2 logs payment-service | grep payment

# Verify payment method validation
# Check Stripe/PayPal dashboards for declined transactions
```

#### 4. Subscription Management Issues
**Symptoms**: Subscription creation failures, billing issues
**Causes**: Invalid customer data, payment method issues
**Solutions**:
```bash
# Check subscription logs
pm2 logs payment-service | grep subscription

# Verify customer data in database
mongo art_advisor --eval "db.customers.find().pretty()"
```

### Log Analysis

#### Log Locations
```bash
# PM2 logs
pm2 logs payment-service

# Application logs (if configured)
tail -f logs/payment-service.log

# Error logs
tail -f logs/error.log
```

#### Key Log Patterns
```bash
# Payment processing errors
grep "payment.*error" logs/payment-service.log

# Webhook processing errors
grep "webhook.*error" logs/payment-service.log

# Subscription errors
grep "subscription.*error" logs/payment-service.log

# API rate limiting
grep "rate.*limit" logs/payment-service.log
```

## Security Considerations

### Security Best Practices

#### 1. Payment Security
- Never log sensitive payment data
- Use HTTPS for all communications
- Implement proper webhook signature verification
- Validate all payment data

#### 2. API Security
- Secure API key storage
- Implement rate limiting
- Use HTTPS in production
- Proper error handling (no sensitive data exposure)

#### 3. Webhook Security
- Verify webhook signatures
- Use HTTPS endpoints
- Validate webhook payloads
- Implement idempotency

#### 4. Data Protection
- Encrypt sensitive data at rest
- Implement data retention policies
- Regular security audits
- PCI DSS compliance (if applicable)

### Security Headers
```javascript
// Implemented security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Vulnerability Scanning
```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

## Testing

### Test Structure
```
src/test/
├── basic.test.js          # Unit tests
├── working.test.js        # Integration tests
├── simple-test.js         # Test runner
└── utils/
    └── testHelpers.js     # Test utilities
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:performance

# Run Jest tests
npm run test:jest

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Categories

#### Unit Tests
- Payment validation functions
- Currency handling
- Subscription logic
- Error handling

#### Integration Tests
- API endpoint testing
- Payment provider integration
- Webhook processing
- Database operations

#### Performance Tests
- Payment processing performance
- API response times
- Concurrent payment handling
- Memory usage testing

### Test Coverage
- **Target Coverage**: > 85%
- **Critical Paths**: 100% coverage
- **Payment Processing**: 100% coverage
- **Error Handling**: 100% coverage

---

## Support & Maintenance

### Contact Information
- **Developer**: Daryl Nyd
- **Repository**: [Payment Service Repository]
- **Documentation**: This file

### Maintenance Schedule
- **Security Updates**: Monthly
- **Dependency Updates**: Quarterly
- **Performance Reviews**: Monthly
- **Payment Provider Monitoring**: Daily
- **Webhook Verification**: Weekly

### Emergency Procedures
1. **Service Down**: Check health endpoint and logs
2. **Payment Provider Issues**: Verify API keys and account status
3. **Webhook Failures**: Check webhook configuration and signatures
4. **Payment Processing Issues**: Monitor payment logs and provider dashboards

---

*Last Updated: January 2024*
*Version: 1.0.0*
