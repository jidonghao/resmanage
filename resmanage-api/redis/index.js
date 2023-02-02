import redis from "redis"

const client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

export default redis
