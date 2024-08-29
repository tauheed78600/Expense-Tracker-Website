
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '5f83805a-01eb-47cd-b327-6697be859a88', 
    });
  }

  async validate(payload: any) {
    console.log('Validate method called');
    console.log('Payload:', payload);
    return { userId: payload.sub, username: payload.username };
  }
  
  
}
