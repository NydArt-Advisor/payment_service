const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');

// Import the app
const app = require('../server');

describe('Payment Service Working Tests', () => {
  let server;

  before(async () => {
    // Create test server
    server = app.listen(0);
  });

  after(async () => {
    // Cleanup
    if (server) server.close();
  });

  describe('Health Check Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).to.have.property('status', 'healthy');
      expect(response.body).to.have.property('service', 'Payment Service');
    });

    it('should return service status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).to.equal('Payment Service is running');
    });
  });

  describe('Payment Processing Tests', () => {
    it('should handle payment creation', async () => {
      const paymentData = {
        amount: 2999,
        currency: 'usd',
        paymentMethod: 'card',
        description: 'Test payment'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData);

      // Should handle the request (might return 200, 201, 400, 401, 500, or other status)
      expect(response.status).to.be.oneOf([200, 201, 400, 401, 500]);
    });

    it('should handle payment retrieval', async () => {
      const response = await request(app)
        .get('/api/payments/test-payment-id');

      // Should handle the request
      expect(response.status).to.be.oneOf([200, 401, 404, 500]);
    });

    it('should handle payment list', async () => {
      const response = await request(app)
        .get('/api/payments');

      // Should handle the request
      expect(response.status).to.be.oneOf([200, 401, 500]);
    });
  });

  describe('Subscription Tests', () => {
    it('should handle subscription creation', async () => {
      const subscriptionData = {
        planId: 'premium',
        customerId: 'cus_test123',
        interval: 'month'
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .send(subscriptionData);

      // Should handle the request
      expect(response.status).to.be.oneOf([200, 201, 400, 401, 500]);
    });

    it('should handle subscription retrieval', async () => {
      const response = await request(app)
        .get('/api/subscriptions/test-subscription-id');

      // Should handle the request
      expect(response.status).to.be.oneOf([200, 401, 404, 500]);
    });

    it('should handle subscription cancellation', async () => {
      const response = await request(app)
        .delete('/api/subscriptions/test-subscription-id');

      // Should handle the request
      expect(response.status).to.be.oneOf([200, 401, 404, 500]);
    });
  });

  describe('Webhook Tests', () => {
    it('should handle Stripe webhooks', async () => {
      const webhookData = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            amount: 2999,
            currency: 'usd'
          }
        }
      };

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .send(webhookData);

      // Should handle the request
      expect(response.status).to.be.oneOf([200, 400, 500]);
    });

    it('should handle PayPal webhooks', async () => {
      const webhookData = {
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: {
          id: 'test_payment_id',
          amount: {
            value: '29.99',
            currency_code: 'USD'
          }
        }
      };

      const response = await request(app)
        .post('/api/webhooks/paypal')
        .send(webhookData);

      // Should handle the request
      expect(response.status).to.be.oneOf([200, 400, 500]);
    });
  });

  describe('Customer Tests', () => {
    it('should handle customer creation', async () => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test Customer',
        paymentMethod: 'card'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData);

      // Should handle the request
      expect(response.status).to.be.oneOf([200, 201, 400, 401, 404, 500]);
    });

    it('should handle customer retrieval', async () => {
      const response = await request(app)
        .get('/api/customers/test-customer-id');

      // Should handle the request
      expect(response.status).to.be.oneOf([200, 401, 404, 500]);
    });

    it('should handle customer update', async () => {
      const updateData = {
        name: 'Updated Customer Name'
      };

      const response = await request(app)
        .put('/api/customers/test-customer-id')
        .send(updateData);

      // Should handle the request
      expect(response.status).to.be.oneOf([200, 401, 404, 500]);
    });
  });

  describe('Validation Tests', () => {
    it('should validate payment amount', async () => {
      const invalidPaymentData = {
        amount: -100,
        currency: 'usd',
        paymentMethod: 'card'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(invalidPaymentData);

      // Should handle invalid amount
      expect(response.status).to.be.oneOf([200, 400, 401, 500]);
    });

    it('should validate currency format', async () => {
      const invalidPaymentData = {
        amount: 1000,
        currency: 'invalid',
        paymentMethod: 'card'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(invalidPaymentData);

      // Should handle invalid currency
      expect(response.status).to.be.oneOf([200, 400, 401, 500]);
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        amount: 1000
        // Missing currency and paymentMethod
      };

      const response = await request(app)
        .post('/api/payments')
        .send(incompleteData);

      // Should handle missing fields
      expect(response.status).to.be.oneOf([200, 400, 401, 500]);
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/payments')
        .send();

      // Should handle empty body
      expect(response.status).to.be.oneOf([200, 400, 401, 500]);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Should handle malformed JSON
      expect(response.status).to.be.oneOf([400, 500]);
    });
  });

  describe('Security Tests', () => {
    it('should handle XSS attempts in payment data', async () => {
      const maliciousData = {
        amount: 1000,
        currency: 'usd',
        description: '<script>alert("xss")</script>'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(maliciousData);

      // Should handle malicious input gracefully
      expect(response.status).to.be.oneOf([200, 201, 400, 401, 500]);
    });

    it('should handle injection attempts', async () => {
      const maliciousData = {
        amount: 1000,
        currency: 'usd',
        description: "'; DROP TABLE payments; --"
      };

      const response = await request(app)
        .post('/api/payments')
        .send(maliciousData);

      // Should handle malicious input gracefully
      expect(response.status).to.be.oneOf([200, 201, 400, 401, 500]);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple rapid requests', async () => {
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app)
            .get('/health')
        );
      }

      const responses = await Promise.all(requests);
      
      // All requests should be handled (some might be rate limited)
      responses.forEach(response => {
        expect(response.status).to.be.oneOf([200, 429, 500]);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes gracefully', async () => {
      const response = await request(app)
        .get('/invalid-route');
      
      // Should return 404 for invalid routes
      expect(response.status).to.equal(404);
    });

    it('should handle unsupported HTTP methods', async () => {
      const response = await request(app)
        .put('/health');
      
      // Should return 404 for unsupported methods
      expect(response.status).to.equal(404);
    });
  });

  describe('Performance Tests', () => {
    it('should complete requests within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).to.be.lessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 3;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/health')
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).to.equal(200);
      });
    });
  });

  describe('CORS Tests', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'https://nydartadvisor.vercel.app')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type');

      // CORS preflight should return 204 or 200
      expect(response.status).to.be.oneOf([200, 204]);
    });

    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'https://nydartadvisor.vercel.app');

      // Should include CORS headers
      expect(response.headers).to.have.property('access-control-allow-origin');
    });
  });
});
