import { createClient, RedisClientType } from 'redis';
import { REDIS_URL } from '../config';


export const redisClient:RedisClientType = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => {
    console.log('Redis Client Error', err);
});

export const runRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis connected successfully");
    }
};


