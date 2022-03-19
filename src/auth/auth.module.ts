// import { forwardRef, Module } from "@nestjs/common"
// import { AuthService } from "./auth.service"
// import { StaffsModule } from "src/staffs/staffs.module"
// import { JwtModule } from "@nestjs/jwt"
// import { JwtStrategy } from "./jwt.strategy"
// import { ConfigModule, ConfigService } from "@nestjs/config"
// import { UsersModule } from "src/users/users.module"
// import { AdminGuard, JwtAuthGuard, StaffGuard, UserGuard } from "./jwt.guard"

// @Module({
//   imports: [
//     ConfigModule,
//     forwardRef(() => StaffsModule),
//     forwardRef(() => UsersModule),
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get<string>("JWT_SECRET"),
//         signOptions: { expiresIn: "7d" },
//       }),
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [AuthService, JwtStrategy, StaffGuard, AdminGuard, UserGuard, JwtAuthGuard],
//   exports: [AuthService, StaffGuard, AdminGuard, UserGuard, JwtAuthGuard],
// })
// export class AuthModule {}
