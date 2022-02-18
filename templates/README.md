# thousandeyes-metrics-service

ThousandEyes API gateway and service to proxy calls from Amazon Connect Stream frontend (softphone, etc) to ThousandEyes API. API service runs NodeJS Lambda + AWS API Gateway.
* `aws-deploy.yaml` -  Cloud Formation Template file that deploys the ThousandEyes metrics API service
* `monitor.zip` - AWS Lambda code

Deploy the metrics API service by clicking on the following CloudFormation deploy link:

**[Deploy to AWS](https://console.aws.amazon.com/cloudformation/home#/stacks/new?templateURL=https://te-amazon-connect.s3.amazonaws.com/aws-deploy.yaml)**

The above link will initiate deployment in your AWS account. Login to AWS, and then fill in your **ThousandEyes Account Email** and **ThousandEyes API Token** in the CloudFormation wizard. 

Once deployed - you will have a new API Gateway that exposes the ThousandEyes Metrics API. 
## ThousandEyes Metrics API
The metrics API exposes the following endpoints:
### `/connection` 
**Response**
```
{
  "message": {
    "ipAddress": "192.168.1.123",
    "subnetMask": "255.255.255.0",
    "publicIpAddress": "157.131.111.121",
    "localPrefix": "192.168.1.0",
    "publicIpRange": "157.131.64.0-157.131.127.255",
    "dnsServers": [
      "192.168.1.1"
    ],
    "gateway": "192.168.1.1",
    "type": "Ethernet",
    "hardwareType": "Wireless",
    "wirelessProfile": {
      "ssid": "teatime",
      "bssid": "fc:ec:da:e7:de:ea",
      "vendor": "Ubiquiti",
      "channel": 149,
      "phyMode": "802.11ac",
      "rssi": -47,
      "noise": -93,
      "quality": 100,
      "txRate": 300
    },
    "interfaceName": "en0"
  }
}
```

### `/http`
**Response**
```
```
### `/network`
**Response**
```
```
### `/agentinfo`
**Response**
```
```