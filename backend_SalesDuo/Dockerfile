# --- Stage 1: Build Environment ---
# This stage installs dependencies and builds the application.
FROM node:20-alpine AS builder

# Set the working directory.
WORKDIR /app

# Copy package configuration files.
COPY package*.json ./

# Install all dependencies, including devDependencies like nodemon.
RUN npm install

# Copy the entire source code.
COPY . .

# --- Stage 2: Production Environment ---
# This stage creates the final, clean image for running the application.
FROM node:20-alpine

# Set the working directory.
WORKDIR /app

# Copy the application code and the installed node_modules from the 'builder' stage.
COPY .. /app/

# Add the local node_modules binaries to the system's PATH.
# This ensures commands like nodemon can be found.
ENV PATH /app/node_modules/.bin:$PATH

# The entrypoint script is already executable from the previous stage.
# Set it as the command to run when the container starts.
ENTRYPOINT ["./entrypoint.sh"]

# Expose the port the application will run on.
EXPOSE 5000

