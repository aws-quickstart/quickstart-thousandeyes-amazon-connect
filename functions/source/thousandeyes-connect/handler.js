'use strict';
const axios = require('axios').default;


module.exports.http = async (event) => {
  var message = "No Connection Info";
  var status = 200;
  var auth = {
    username: process.env.TE_USER,
    password: process.env.TE_TOKEN
  }

  // console.log(event);

  if (!event || !event.queryStringParameters || (!event.queryStringParameters.testId)) {
    message = "Missing 'testId' parameter.";
  } else if (!event || (!event.queryStringParameters.aid)) {
    message = "Missing 'aid' parameter.";
  } else {
    try {
      var response = await request (`https://api.thousandeyes.com/v6/endpoint-data/tests/web/http-server/${event.queryStringParameters.testId}.json`, event.queryStringParameters.aid, auth);
      status = response.status;      
      message = response.data.endpointWeb.httpServer[0];
    }
    catch {
    }
  }

  return slsResponse(status, message);
};

module.exports.network = async (event) => {
  var message = "No Connection Info";
  var status = 200;
  var auth = {
    username: process.env.TE_USER,
    password: process.env.TE_TOKEN
  }

  // console.log(event);

  if (!event || !event.queryStringParameters || (!event.queryStringParameters.testId)) {
    message = "Missing 'testId' parameter.";
  } else if (!event || (!event.queryStringParameters.aid)) {
    message = "Missing 'aid' parameter.";
  } else {
    try {
      var response = await request (`https://api.thousandeyes.com/v6/endpoint-data/tests/net/metrics/${event.queryStringParameters.testId}.json`, event.queryStringParameters.aid, auth);
      status = response.status;
      message = response.data.endpointNet.metrics[0];
    }
    catch {
    }
  }

  return slsResponse(status, message);
};

module.exports.agentinfo = async (event) => {
  var message = "No Connection Info";
  var status = 200;
  var auth = {
    username: process.env.TE_USER,
    password: process.env.TE_TOKEN
  }

  console.log(event);

  if (!event || !event.queryStringParameters || (!event.queryStringParameters.accountGroupName)
  || (!event.queryStringParameters.hostName)
  || (!event.queryStringParameters.testName)) {
    return slsResponse(status, "Missing accountGroup name, agentName, or testName.");
  } else {
  
    let agentInfo = {};
  
    try {
      var response = await request (`https://api.thousandeyes.com/v6/account-groups.json`, null, auth);
      if (response.data.accountGroups) {
        response.data.accountGroups.forEach(ag => {
          if (ag.accountGroupName == event.queryStringParameters.accountGroupName) {
            agentInfo.accountGroupId = ag.aid;
          }
        })
      } else {
        return slsResponse(status, "User does not belong to any account groups."); 
      };

      if (!agentInfo.accountGroupId) {
        message = `Could not find Account Group named ${event.queryStringParameters.accountGroupName}`;
        return slsResponse(status, message);
      }

      response = await request (`https://api.thousandeyes.com/v6/endpoint-tests.json`, agentInfo.accountGroupId, auth);
      
      if (response.data.endpointTest) {
        response.data.endpointTest.forEach(test => {
          if (test.testName == event.queryStringParameters.testName) {
            agentInfo.testId = test.testId;
          }
        })
      } 
      
      if (!agentInfo.testId) {
        return slsResponse(status, `Could not find endpoint test ${event.queryStringParameters.testName} in account group ${event.queryStringParameters.accountGroupName}.`); 
      }


      if (!event.queryStringParameters.hostName) {
        message = `Missing hostName parameter`; // ${event.queryStringParameters.accountGroupName}`;
        return slsResponse(status, message);
      }

      console.log(`https://api.thousandeyes.com/v6/endpoint-agents.json?computerName=${event.queryStringParameters.hostName}`);
      response = await request (`https://api.thousandeyes.com/v6/endpoint-agents.json?computerName=${event.queryStringParameters.hostName}`, agentInfo.accountGroupId, auth);
      
      console.log(response);

      if (response.data.endpointAgents && response.data.endpointAgents.length > 0) {
        agentInfo.agentId = response.data.endpointAgents[0].agentId;
      } 
      
      if (!agentInfo.agentId) {
        return slsResponse(status, `Could not find endpoint agent regisered for user device ${event.queryStringParameters.computerName}`); 
      }
      
      console.log(agentInfo);
      return slsResponse(response.status, agentInfo);
    }
    catch (e) {
      console.log(`Error: ${e}`)
    }

  }

  return slsResponse(status, message);
};

module.exports.connection = async (event) => {
  var message = "No Connection Info";
  var status = 200;
  if (!event || !event.queryStringParameters || (!event.queryStringParameters.aid)
  || (!event.queryStringParameters.agentId)) {
    return slsResponse(status, "Missing aid or agentId.");
  } else {

    var reqBody = {
      searchFilters: [ {  key: 'agentId',  values: [`${event.queryStringParameters.agentId}`] } ]
    }
    var auth = {
      username: process.env.TE_USER,
      password: process.env.TE_TOKEN
    }

    try {
      var response = await request ('https://api.thousandeyes.com/v6/endpoint-data/network-topology.json?window=1h', event.queryStringParameters.aid, auth, 'post', reqBody,
      {
        window: '1h'
      });
      status = response.status;

      if (response.data.networkProbes.length > 0) {
        var networkProbeId = response.data.networkProbes[response.data.networkProbes.length - 1].networkProbeId;
        var resp2 = await request (`https://api.thousandeyes.com/v6/endpoint-data/network-topology/${networkProbeId}.json`, event.queryStringParameters.aid, auth);
        status = resp2.status;
        message = resp2.data.networkProbes[0].networkProfile;
      }
    } catch {
    }
}

  return slsResponse(status, message);
};


module.exports.status = async (event) => {
  return await query ('https://api.thousandeyes.com/v6/status/');
};


async function request (urlPath, aid = null, _auth = null, _method='get', _body = null, _params = null) {
  try {
    var resp = {};

    var opt = {
      url: urlPath,
      method: _method
    }

    if (aid) {
      opt = {...opt, params: {aid: aid}}
    }
    if (_params){
      opt.params = {...opt.params, ..._params }
    }
    if (_auth){
      opt = {...opt, auth: _auth}
    }
    if (_body){
     opt = {...opt, data: _body}
    }

    // console.log (opt);

    await axios(opt)
    .then(function (response) {
      resp = {
        statusCode: response.status,
        data: response.data
      };
    })
    .catch(error => {
      return {
        statusCode: 501,
        data: `${error}`
      }
    });
  } catch (error) {
    return {
      statusCode: 501,
      data: `${error.message}`
    }
  }
  return resp;
}

function slsResponse (status, message) {
  return { 
    statusCode: status, 
    body: JSON.stringify( { message }, null, 2 ),
    headers: {
    // This is the only thing that get's cors to work. Serverless config doesn't
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
    }
  }
}


