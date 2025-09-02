import { connection } from "../../config/redis";

export class RedisService {
  getValue = async (key: string) => {
    return await connection.get(key);
  };
  setValue = async (
    key: string,
    value: string,
    timetoliveoInSeconds?: number
  ) => {
    if (timetoliveoInSeconds) {
      return await connection.set(key, value, "EX", timetoliveoInSeconds);
    }
    return await connection.set(key, value);
  };
}
