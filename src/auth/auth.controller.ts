// @Post("/login")
//   async login(@Body() loginUserDto: LoginUserDto, @Res() res): Promise<string> {
//     const user = await this.userService.login(loginUserDto.username, loginUserDto.password)
//     return res.status(201).json({
//       statusCode: 201,
//       message: "Login successfully",
//       jwt: this.authService.generateJWT(user["_id"], "User"),
//       is_thai_language: user["is_thai_language"],
//     })
//   }