const { v4: uuidv4 } = require("uuid");

module.exports = (req, res, next) => {
  const traceId = `REQ_${uuidv4().slice(0, 6)}`;
  const startTime = Date.now();

  req.traceId = traceId;
  res.locals.traceId = traceId;

  const originalJson = res.json;
  let responseBody;

  res.json = function (body) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  console.log("\n==================================================");
  console.log(`TRACE ID  : ${traceId}`);
  console.log(`TIME      : ${new Date().toISOString()}`);
  console.log(`REQUEST   : ${req.method} ${req.originalUrl}`);
  console.log(`USER AGENT: ${req.headers["user-agent"]}`);

  console.log("PARAMS    :", req.params);
  console.log("QUERY     :", req.query);
  console.log(`BODY      :`, req.body);

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    let resultType = "SUCCESS";
    let colorCode = "\x1b[32m";

    if (statusCode >= 400 && statusCode < 500) {
      resultType = "FAILED";
      colorCode = "\x1b[33m";
    }

    if (statusCode >= 500) {
      resultType = "ERROR";
      colorCode = "\x1b[31m";
    }

    console.log(
      `${colorCode}RESPONSE  : ${resultType} (${statusCode})\x1b[0m`
    );

    if (responseBody?.message) {
      console.log(`MESSAGE   : ${responseBody.message}`);
    }

    if (responseBody?.error) {
      console.log(`ERROR     : ${responseBody.error}`);
    }

    if (process.env.NODE_ENV === "development" && responseBody?.stack) {
      console.log("STACK TRACE:");
      console.log(responseBody.stack);
    }

    console.log(`DURATION  : ${duration} ms`);
    console.log("==================================================\n");
  });

  next();
};