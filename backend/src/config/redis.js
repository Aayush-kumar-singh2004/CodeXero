const { createClient }  = require('redis');
const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host:  'redis-10891.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 10891
    }
});
module.exports = redisClient;

//  import { createClient } from 'redis';
// const client = createClient({
//     username: 'default',
//     password: 
//     socket: {
//         host: 'redis-10891.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
//         port: 10891
//     }
// });

// client.on('error', err => console.log('Redis Client Error', err));

// await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar

