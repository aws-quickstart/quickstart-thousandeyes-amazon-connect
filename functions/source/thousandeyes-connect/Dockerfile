FROM lambci/lambda:build-nodejs12.x

# Copy npm package.json and install prod dependencies on its own layer
# since packages is not expected to change as often as the lambda code
COPY package*.json ./
RUN npm install --only=production 

# Copy the remaining lambda code and zip up the whole folder recursively
COPY . .
RUN zip -X -r lambda.zip ./

# Copy the zipfile to the output path 
# e.g, lambda_zip_path: functions/packages/lambda-self-signed-certificate/lambda.zip
CMD mkdir -p /output/ && mv lambda.zip /output/