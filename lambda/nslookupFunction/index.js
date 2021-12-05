const dns = require('dns');

exports.handler = async (event) => {
  console.log(event.queryStringParameters);
  const domain = event.queryStringParameters.domain;

  const address = await new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, family) => {
      if(err) reject(err);
      resolve(address);
    });
  });
  console.log(address);

  const response = {
    statusCode: 200,
    body: address
  };

  return response;
};
