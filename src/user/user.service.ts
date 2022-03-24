import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { FindConditions, FindOneOptions, Repository } from 'typeorm'
import { UpdateRelationshipDto, CreateUserDto, IDto } from './dto/user.dto'
import { DuplicateElementException, InvalidUserTypeException, UserNotFoundException } from './user.exception'
import { plainToInstance } from 'class-transformer'
import { AuthService } from 'src/auth/auth.service'
import { Role } from 'src/common/roles'
@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>, private authService: AuthService) {}

  schemaToDto(schema: User, dtoClass?: IDto<Partial<Omit<User, 'password'>> & { uid: number }>) {
    return plainToInstance(dtoClass, schema, { excludeExtraneousValues: true })
  }
  async findOne(
    conditions: FindConditions<User>,
    options?: FindOneOptions<User> & { shouldBeElderly?: boolean; shouldExist?: boolean },
  ): Promise<User> {
    const user = await this.userRepository.findOne(conditions, options)
    if (!options) return user
    if (options.shouldExist && !user) throw new UserNotFoundException()
    if (options.shouldBeElderly !== undefined && ((options.shouldBeElderly && !user.isElderly) || (!options.shouldBeElderly && user.isElderly)))
      throw new InvalidUserTypeException()
    return user
  }
  async createRelationship({ eid, cid }: UpdateRelationshipDto): Promise<User> {
    //TODO: validate uid from auth
    const caretaker = await this.findOne({ uid: cid }, { shouldBeElderly: false, shouldExist: true })
    const elderly = await this.findOne({ uid: eid }, { relations: ['takenCareBy'], shouldBeElderly: true, shouldExist: true })
    if (elderly.takenCareBy.find((currentCaretaker) => currentCaretaker.uid === cid)) throw new DuplicateElementException('Relationship')
    elderly.takenCareBy.push(caretaker)
    return await this.userRepository.save(elderly)
  }
  async deleteRelationship({ eid, cid }: UpdateRelationshipDto): Promise<User> {
    //TODO: validate uid from auth
    await this.findOne({ uid: cid }, { shouldBeElderly: false })
    const elderly = await this.findOne({ uid: eid }, { relations: ['takenCareBy'], shouldBeElderly: true, shouldExist: true })
    const newCaretakers = elderly.takenCareBy.filter((c) => c.uid !== cid)
    return await this.userRepository.save({ ...elderly, takenCareBy: newCaretakers })
  }
  async findCaretakerByElderlyId(uid: number): Promise<User[]> {
    const elderly = await this.findOne({ uid: uid }, { relations: ['takenCareBy'], shouldBeElderly: true, shouldExist: true })
    return elderly.takenCareBy
  }
  async findElderlyByCaretakerId(uid: number): Promise<User[]> {
    const caretaker = await this.findOne({ uid: uid }, { relations: ['takingCareOf'], shouldBeElderly: false, shouldExist: true })
    return caretaker.takingCareOf
  }
  async createUser(dto: CreateUserDto): Promise<{ uid: number; role: Role }> {
    const existingUser = await this.findOne({ phone: dto.phone })
    if (existingUser) throw new DuplicateElementException('Phone number')
    const hashedPassword = await this.authService.hashPassword(dto.password)
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      reminders: [],
      emotionalRecords: [],
      memoryPracticeQuestions: [],
      healthRecords: [],
      modules: [],
      takingCareOf: [],
      takenCareBy: [],
    })
    return (await this.userRepository.insert(user)).identifiers.map((i) => ({
      uid: i.uid,
      role: i.isElderly ? 'Elderly' : ('Caretaker' as Role),
    }))[0]
  }
  async updateUser({ uid, ...newInfo }: Partial<User>): Promise<User> {
    const { uid: foundUid } = await this.findOne({ uid: uid }, { shouldExist: true })
    return await this.userRepository.save({
      uid: foundUid,
      ...newInfo,
    })
  }

  async findByPhoneNumber(phone: string): Promise<User> {
    const user = await this.findOne({ phone: phone }, { shouldExist: true })
    return user
  }

  async findUserById(uid: number) {
    const user = await this.findOne({ uid: uid }, { shouldExist: true })
    return user
  }

  async findCaretakerById(uid: number) {
    const caretaker = await this.findOne({ uid: uid }, { shouldBeElderly: false, shouldExist: true })
    return caretaker
  }

  async findElderlyById(uid: number) {
    const elderly = await this.findOne({ uid: uid }, { shouldBeElderly: true, shouldExist: true })
    return elderly
  }

  async login(phone: string, password: string): Promise<{ uid: number; role: Role }> {
    const user = await this.findByPhoneNumber(phone)
    if (!user) throw new BadRequestException("Phone number doesn't exist")

    const isPasswordMatched = await this.authService.comparePassword(password, user.password)
    if (!isPasswordMatched) throw new BadRequestException("Password doesn't match")

    const res = {
      uid: user.uid as number,
      role: user.isElderly ? 'Elderly' : ('Caretaker' as Role),
    }

    return res
  }
}
