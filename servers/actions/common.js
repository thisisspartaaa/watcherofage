/**
 * Created by root on 2018/3/19.
 */
const hbsdk = require('../sdk/hbsdk');
const constant = require('../utils/constant');
let subscribeSymbols = require('../utils/subscribeSymbols')




// 按注释的步骤逐步放开注释，运行程序，验证接口
function run() {
  // 准备工作，填写config/default.json中的:
  // access_key & secretkey, www.huobi.com上申请
  // uid 登陆后看自己的UID
  // trade_password 可以先不填，提现时需要

  // 第一步，获取account_id_pro
  // hbsdk.get_account().then(console.log);
  // 运行demo，看控制台的输出结果
  // 把get_account获取到的type=spot的id填写到:
  // default.json中的${account_id_pro}中去

  // 第二步，获取Balance和OpenOrders
  // hbsdk.get_balance().then(console.log);
  // hbsdk.get_open_orders('btcusdt').then(console.log);

  // 第三步，交易
  // hbsdk.buy_limit('ltcusdt', 0.01, 0.1);
  // 注意交易是有精度的，精度数据在以下接口中获取
  // https://api.huobi.pro/v1/common/symbols

  // 第四步，检查订单
  // hbsdk.get_order(377378515).then(console.log);

  // 第五步，提现
  // 先去网站上设置好安全提现地址
  // 欢迎打赏到我的钱包，我可以协助测试 ^^
  // hbsdk.withdrawal('0x9edfe04c866d636526828e523a60501a37daf8f6', 'etc', 1);
}


let compute = async (ctx, next) => {
  try {
    // if (!ctx.params || !ctx.params.projectId || !ctx.params.apiId) throw new Error('PARAMS_ERR');
    // let market_depth = await hbsdk.market_depth('btcusdt', 'step0')//.then(console.log);
    // hbsdk.get_open_orders('btcusdt').then(console.log);
    subscribeSymbols.setter = {
      symbol: 'xrpbtc',
      step: 'step0'
    }
    ctx.body = Object.assign(constant.SUCCESS, {result: subscribeSymbols.orderBook});
    return next();
  } catch (err) {
    ctx.body = 'compute' + err;
    return next();
  }
};

let buy = async (ctx, next) => {
  try {
    if (!ctx.query || !ctx.query.s || !ctx.query.a) throw new Error('PARAMS_ERR');
    let {s, a, price} = ctx.query
    let useSymbol = s.split('_')[0]
    let buySymbol = s.split('_')[1]

    // let  market_depth = await hbsdk.buy_limit(symbol, amount, price)//.then(console.log);

    ctx.body = Object.assign(constant.SUCCESS, {result: get_balance});
    return next();
  } catch (err) {
    ctx.body = 'buy ' + err;
    return next();
  }
};

function handleBalance(balance) {
  if (balance && balance.length) {
    let tem = {}
    for (let i = 0, il = balance.length; i < il; i++) {
      tem[balance[i].currency + '_' + balance[i].type] = balance[i].balance
    }
    return tem
  }
}

let balance = async (ctx, next) => {
  try {
    let get_balance = await hbsdk.get_balance()
    if (get_balance.state === 'lock') throw new Error(get_balance)
    ctx.body = Object.assign(constant.SUCCESS, {result: handleBalance(get_balance.list)});
    return next();
  } catch (err) {
    ctx.body = 'balance ' + err;
    return next();
  }
}


module.exports = function (app) {
  app.get("/server/compute", compute);
  app.get("/server/buy", buy);
  app.get("/server/balance", balance);


};