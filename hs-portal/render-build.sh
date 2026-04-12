#!/usr/bin/env bash
# exit on error
set -o errexit

# Render sets NODE_ENV=production by default, which skips devDependencies.
# We must include them so tsc and @types are available for the build.
npm install --include=dev
npm run build # Only if you are using TypeScript

# This ensures Puppeteer can find a browser on the Render free instance
# Note: Free tier may struggle with memory; if it crashes, we may need a 
# remote browser service like Browserless.io (also has a free tier).
