import { forwardRef, Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { JwtModule } from "@nestjs/jwt"
import { JwtStrategy } from "./jwt.strategy"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { UsersModule } from "src/users/users.module"
import { CaretakerGuard, JwtAuthGuard, ElderlyGuard } from "./jwt.guard"

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(process.env.JWT_SECRET_KEY),
        signOptions: { expiresIn: "7d" },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, CaretakerGuard, ElderlyGuard, JwtAuthGuard],
  exports: [AuthService, CaretakerGuard, ElderlyGuard, JwtAuthGuard],
})
export class AuthModule {}
