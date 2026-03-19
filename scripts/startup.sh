#!/bin/bash

# Run Prisma migrations
prisma migrate deploy

# Start the application
node app.js || { echo 'App failed to start'; exit 1; }