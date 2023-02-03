import { createClient } from 'redis';

const client = createClient({url:"redis://127.0.0.1:6379"});

client.on('error', err => console.log('111Redis Client Error', err));

await client.connect();

await client.set('key', 'value',{
    EX:20
});
const value = await client.get('key');
await client.disconnect();