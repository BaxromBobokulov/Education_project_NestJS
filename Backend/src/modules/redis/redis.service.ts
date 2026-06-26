import { Injectable, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit {
    private clint: any;
    onModuleInit() {
        this.clint = new Redis({
            host: process.env.REDIS_HOST || "localhost"
        })
    }
    async set(key: string, value: number){
        await this.clint.set(key, value, "EX", 120)
    }

    async get(key:string){
        return this.clint.get(key)
    }

    async del(key: string){
        this.clint.del(key)
    }
}
