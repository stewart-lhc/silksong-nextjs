#!/usr/bin/env node

/**
 * Development server for testing Newsletter Kit components
 * Provides a local testing environment with hot reload
 */

const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// WebSocket for hot reload
const wss = new WebSocket.Server({ port: 3002 });

// Serve static files
app.use('/static', express.static(path.join(__dirname, '../dist')));
app.use('/examples', express.static(path.join(__dirname, '../examples')));

// Mock API endpoints for testing
app.use(express.json());

// Mock subscriber count
let mockSubscriberCount = 1247;

// Mock subscriber database
const mockSubscribers = new Set();

app.get('/api/newsletter/count', (req, res) => {
  res.json({ count: mockSubscriberCount });
});

app.post('/api/newsletter/subscribe', (req, res) => {
  const { email, source = 'web' } = req.body;
  
  // Simulate validation
  if (!email || !email.includes('@')) {
    return res.status(400).json({ 
      error: 'Invalid email address' 
    });
  }
  
  // Check for duplicate
  if (mockSubscribers.has(email)) {
    return res.status(409).json({ 
      error: 'Email already subscribed',
      code: 'ALREADY_SUBSCRIBED'
    });
  }
  
  // Simulate rate limiting (very basic)
  if (Math.random() < 0.1) { // 10% chance
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait before trying again.',
      resetTime: Date.now() + 60000
    });
  }
  
  // Add to mock database
  mockSubscribers.add(email);
  mockSubscriberCount++;
  
  // Simulate processing delay
  setTimeout(() => {
    res.status(201).json({
      success: true,
      message: 'Successfully subscribed!',
      subscription: {
        id: `sub_${Date.now()}`,
        email,
        subscribed_at: new Date().toISOString()
      }
    });
  }, Math.random() * 1000 + 500); // 0.5-1.5s delay
});

// Test page endpoint
app.get('/test/:component', (req, res) => {
  const { component } = req.params;
  const testPagePath = path.join(__dirname, '../test-pages', `${component}.html`);
  
  if (fs.existsSync(testPagePath)) {
    res.sendFile(testPagePath);
  } else {
    res.status(404).send(`Test page for ${component} not found`);
  }
});

// Component explorer
app.get('/explorer', (req, res) => {
  const explorerPath = path.join(__dirname, '../test-pages/explorer.html');
  
  if (fs.existsSync(explorerPath)) {
    res.sendFile(explorerPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Newsletter Kit Component Explorer</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: system-ui, sans-serif; }
        </style>
      </head>
      <body class="bg-gray-50 p-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-8">Newsletter Kit Component Explorer</h1>
          
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="font-semibold mb-2">Basic Form</h3>
              <p class="text-gray-600 text-sm mb-4">Simple newsletter subscription form</p>
              <a href="/test/basic-form" class="text-blue-600 hover:underline">View Test →</a>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="font-semibold mb-2">Hero Form</h3>
              <p class="text-gray-600 text-sm mb-4">Large form for landing pages</p>
              <a href="/test/hero-form" class="text-blue-600 hover:underline">View Test →</a>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="font-semibold mb-2">Modal Form</h3>
              <p class="text-gray-600 text-sm mb-4">Popup subscription form</p>
              <a href="/test/modal-form" class="text-blue-600 hover:underline">View Test →</a>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="font-semibold mb-2">Inline Form</h3>
              <p class="text-gray-600 text-sm mb-4">Horizontal layout form</p>
              <a href="/test/inline-form" class="text-blue-600 hover:underline">View Test →</a>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="font-semibold mb-2">Minimal Form</h3>
              <p class="text-gray-600 text-sm mb-4">Clean, minimal design</p>
              <a href="/test/minimal-form" class="text-blue-600 hover:underline">View Test →</a>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="font-semibold mb-2">Theme Gallery</h3>
              <p class="text-gray-600 text-sm mb-4">All available themes</p>
              <a href="/test/theme-gallery" class="text-blue-600 hover:underline">View Test →</a>
            </div>
          </div>
          
          <div class="mt-12 bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Development Tools</h2>
            <div class="space-y-2">
              <p><strong>Mock API:</strong> This dev server provides mock endpoints for testing</p>
              <p><strong>Subscriber Count:</strong> Currently ${mockSubscriberCount} (simulated)</p>
              <p><strong>Rate Limiting:</strong> 10% chance of rate limit error (for testing)</p>
              <p><strong>Hot Reload:</strong> WebSocket connected on port 3002</p>
            </div>
          </div>
        </div>
        
        <script>
          // Hot reload functionality
          const ws = new WebSocket('ws://localhost:3002');
          ws.onmessage = function(event) {
            if (event.data === 'reload') {
              window.location.reload();
            }
          };
        </script>
      </body>
      </html>
    `);
  }
});

// Default route
app.get('/', (req, res) => {
  res.redirect('/explorer');
});

// File watcher for hot reload
const watcher = chokidar.watch([
  path.join(__dirname, '../src'),
  path.join(__dirname, '../examples'),
  path.join(__dirname, '../test-pages')
], {
  ignored: /node_modules/,
  persistent: true
});

watcher.on('change', (filePath) => {
  console.log(`📝 File changed: ${path.relative(process.cwd(), filePath)}`);
  
  // Notify all connected WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send('reload');
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    subscribers: mockSubscriberCount,
    connections: wss.clients.size
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Dev server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    availableEndpoints: [
      '/',
      '/explorer', 
      '/api/newsletter/count',
      '/api/newsletter/subscribe',
      '/test/:component',
      '/health'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Newsletter Kit Dev Server running!

📍 URLs:
  • Component Explorer: http://localhost:${PORT}/explorer
  • Health Check: http://localhost:${PORT}/health
  • Mock API: http://localhost:${PORT}/api/newsletter/*
  
🔥 Hot Reload: WebSocket on port 3002
📊 Mock Data: ${mockSubscriberCount} subscribers

Happy developing! 🎉
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down dev server...');
  watcher.close();
  wss.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dev server...');
  watcher.close();
  wss.close();
  process.exit(0);
});