import { sign } from "jsonwebtoken";

export class TokenService {
  generateToken = (payload: object, secretKey: string) => {
    return sign(payload, secretKey, { expiresIn: "2h" });
    //2h, 30m, 2s
  };
}
