const amqp = require("amqplib");

const message = "new a product: Title abc";

const log = console.log;

console.log = function () {
  log.apply(console, [new Date()].concat(arguments));
};

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:12345@localhost");
    const channel = await connection.createChannel();

    const notificationExchange = "notificationEx"; // notification direct
    const notiQueue = "notificationQueueProcess"; // assertQueue
    const notificationExchangeDLX = "notificationExDLX"; // notificationEX direct
    const notificationRoutingKeyDLX = "notificationRoutingKeyDLX"; // assert

    // 1. create exchange
    await channel.assertExchange(notificationExchange, "direct", {
      durable: true,
    });

    // 2. create queue
    const queueResult = await channel.assertQueue(notiQueue, {
      exclusive: false, // cho phép các kết nối truy cập vào cùng một lúc hàng đợi
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
    });

    // 3. bind queue
    await channel.bindQueue(queueResult.queue, notificationExchange);

    // 4. send message
    const msg = "a new product";
    console.log(`product msg::`, msg);
    await channel.sendToQueue(queueResult.queue, Buffer.from(msg), {
      expiration: "10000",
    });

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(`error:: `, error);
  }
};

runProducer().catch(console.error);
