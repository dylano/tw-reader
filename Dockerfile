# Use the official Node.js 10 image.
# https://hub.docker.com/_/node
FROM node:10

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . .
 
ENV MONGODB_URI mongodb://reader:qwer4321@ds139198.mlab.com:39198/reader-gcp
ENV TW_CONSUMER_KEY qJa6m7SdPBNVp9MkloaPDPgf3
ENV TW_CONSUMER_SECRET 9AUXgNSSi1tNFfLJMla6J593LhwgWpcD5icpqQ3v8gGV4DkSqM
ENV TW_TOKEN_KEY 16049000-U7OEyf0F6PkMSWmPLUCm10i5fj516Xc0Upg7GsGVQ
ENV TW_TOKEN_SECRET MGlUmlCPH5na4g4K59UaTSn3AxKehLpBoIpRz5yceZAQl

# Run the web service on container startup.
CMD [ "npm", "start" ]
