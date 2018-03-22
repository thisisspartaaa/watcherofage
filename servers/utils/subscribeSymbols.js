/**
 * Created by root on 2018/3/21.
 */
const WebSocket = require('ws');
const moment = require('moment');
const pako = require('pako');
const WS_URL = 'wss://api.huobipro.com/ws' //'wss://api.huobi.pro/ws';


const Symbols = class symbols {
  constructor(symbols) {
    this.symbols = symbols || []
    this.step = 'step0'
    this.init()
    this.waitForSub =[]
    this.orderBook={}
  }

  set setter(symbols) {
    console.log('symbols change', this.symbols, 'push', symbols)
    this.symbols.push(symbols)
      if(this.wsOn){
        if (this.symbols.length) {
          this.subscribe(this.symbols);}
      }else{
        this.waitForSub.push(symbols)
        this.init()
    }
  }

  get getter() {
    return this.symbols
  }
  handle(data) {
    // console.log('received', data.ch, 'data.ts', data.ts, 'crawler.ts', moment().format('x'));
    let symbol = data.ch.split('.')[1];
    let channel = data.ch.split('.')[2];
    console.log('handle',channel)
    switch (channel) {
      case 'depth':
        this.orderBook[symbol] = data.tick;
        break;
      case 'kline':
        console.log('kline', data.tick);
        break;
    }
  }
  init() {
    this.ws = new WebSocket(WS_URL);

    this.ws.on('open', () => {
      console.log('ws open');
      this.wsOn = true
      if(this.waitForSub.length){
        this.subscribe(this.waitForSub)
      }
    });
    this.ws.on('message', (data) => {
      let text = pako.inflate(data, {
        to: 'string'
      });
      let msg = JSON.parse(text);
      if (msg.ping) {
        console.log('ws on message msg.ping', msg.ping);
        this.ws.send(JSON.stringify({
          pong: msg.ping
        }));
      } else if (msg.tick) {
        // console.log(msg);
        this.handle(msg);
      } else {
        console.log('ws on message', text);
      }
    });
    this.ws.on('close', () => {
      this.wsOn = false
      console.log('ws close');
    });
    this.ws.on('error', err => {
      this.wsOn = false
      console.log('ws error', err);
    });
  }

  subscribe(toSub) {
    // 订阅深度
    // 谨慎选择合并的深度，ws每次推送全量的深度数据，若未能及时处理容易引起消息堆积并且引发行情延时
    for (let symbol of  toSub) {
      console.log({
        "sub": `market.${symbol.symbol}.depth.${symbol.step}`,
        "id": `${symbol.symbol}`
      })
      if(this.wsOn){
        this.ws.send(JSON.stringify({
          "sub": `market.${symbol.symbol}.depth.${symbol.step}`,
          "id": `${symbol.symbol}`
        }));
      }else{
        this.init()
      }
    }
    // 订阅K线
    // for (let symbol of this.symbols) {
    //   ws.send(JSON.stringify({
    //     "sub": `market.${symbol}.kline.1min`,
    //     "id": `${symbol}`
    //   }));
    // }
  }

}


module.exports = new Symbols()