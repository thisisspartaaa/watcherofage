'use strict';
const Koa        = require('koa');
const fs         = require('fs');
const app        = new Koa();
const Router     = require('koa-router');
const router     = new Router();
const bodyParser = require("co-body");
const moment     = require('moment');
const uuidV1     = require('uuid/v1');
const pkg        = require('./package.json')
const interfaces = require('os').networkInterfaces();
const isLocal    = process.env.LOCAL !== undefined;
const isProd     = process.env.NODE_ENV === 'PRD';
const isPre      = process.env.NODE_ENV === 'PRE';
const isDev      = process.env.NODE_ENV === 'DEV';

//get ip
let IPv4 = '127.0.0.1';
for (var key in interfaces) {
  var alias = 0;
  interfaces[key].forEach(function (details) {
    if ((details.family == 'IPv4' && key == 'en0') || (details.family == 'IPv4' && key == 'eth0')) {
      IPv4 = details.address;
    }
  });
}
module.exports = {isDev, isPre, isLocal, IPv4, pkg, uuidV1};

//加载actions
require("./actions/common")(router)



//bootstrap
app.listen(pkg.port, function () {
  console.log(`${pkg.name} listen at ${IPv4}:${pkg.port} in ${process.env.NODE_ENV} , pid is ${process.pid}`);
});


//middleWares

app
  .use(async (ctx, next) => {
    if (ctx.method === "PUT" || ctx.method === "POST") {
      ctx.request.body = await bodyParser(ctx);
      await next();
    } else {
      await next();
    }
  })
  .use(async (ctx, next) => {//日志
    let requestStartTime = new Date();
    let requestID        = uuidV1(requestStartTime);
    console.log(`${requestID}\t${ctx.method}\t${ctx.url}\t${JSON.stringify(ctx.request.body)}`);
    await next();
    // console.log(`${requestID}\tuse: ${ new Date() - requestStartTime }ms\treturn: ${JSON.stringify(ctx.body)}`);
  })
  .use(router.routes())//路由
  .use(router.allowedMethods())
  .on('error', app.onerror)//错误处理




process.on('uncaughtException', function (err) {
  let now  = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  let cont = `${now}|${uuidV1()}|${now}|${pkg.sysCode}|${IPv4}|${pkg.name}|uncaughtException|1|${('uncaughtException')}||||||${err.message}|${err.code}|${(err.stack)}|||||1||api|0.0.0.4`;
  console.error(cont);
});


process.on('unhandledRejection', function (reason, promise) {
  let now  = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  let cont = `${now}|${uuidV1()}|${now}|${pkg.sysCode}|${IPv4}|${pkg.name}|unhandledRejection|1|${('unhandledRejection')}||||||${reason}|${promise}|${(reason)}|||||1||api|0.0.0.4`;
  console.error(cont);
});


