FROM node:20-slim

# Install dependencies for Puppeteer/Chromium to run on Debian/Ubuntu based slim images
RUN apt-get update && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
      fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip installing Chrome since we're using the installed package.
# Actually, the hs-portal code doesn't set executablePath explicitly so letting Puppeteer download
# its bundled Chromium is safer. These apt packages just satisfy its shared library requirements.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build TypeScript code
RUN npm run build

# Clean up source maps or keep them. We'll leave them for now.
# Expose the Render default port if omitted in ENV
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]
