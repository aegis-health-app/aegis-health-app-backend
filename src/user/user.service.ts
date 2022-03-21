import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { FindConditions, FindOneOptions, Repository } from 'typeorm'
import { UpdateRelationshipDto, UpdateUserDto, CreateUserDto } from './dto/user.dto'
import { DuplicateElementException, InvalidUserTypeException, UserNotFoundException } from './user.exception'
import { PersonalInfo } from './user.interface'

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}
  private dtoToSchema(dto: Partial<PersonalInfo>) {
    return {
      imageid: dto.imageId,
      fname: dto.firstName,
      lname: dto.lastName,
      dname: dto.displayName,
      bday: dto.birthDate,
      gender: dto.gender,
      isElderly: dto.isElderly,
      healthCondition: dto.healthCondition,
      bloodType: dto.bloodType,
      personalMedication: dto.personalMedication,
      allergy: dto.allergy,
      vaccine: dto.vaccine,
      ...dto,
    }
  }
  async findOne(
    conditions: FindConditions<User>,
    options?: FindOneOptions<User> & { shouldBeElderly?: boolean; shouldExist?: boolean }
  ) {
    const user = await this.userRepository.findOne(conditions, options)
    if (!options) return user
    if (options.shouldExist && !user) throw new UserNotFoundException()
    if (
      options.shouldBeElderly !== undefined &&
      ((options.shouldBeElderly && !user.isElderly) || (!options.shouldBeElderly && user.isElderly))
    )
      throw new InvalidUserTypeException()
    return user
  }
  async createRelationship({ eid, cid }: UpdateRelationshipDto) {
    //TODO: validate uid from auth
    const caretaker = await this.findOne({ uid: cid }, { shouldBeElderly: false, shouldExist: true })
    const elderly = await this.findOne(
      { uid: eid },
      { relations: ['takenCareBy'], shouldBeElderly: true, shouldExist: true }
    )
    if (elderly.takenCareBy.find((currentCaretaker) => currentCaretaker.uid === cid))
      throw new DuplicateElementException('Relationship')
    elderly.takenCareBy.push(caretaker)
    return await this.userRepository.save(elderly)
  }
  async deleteRelationship({ eid, cid }: UpdateRelationshipDto) {
    //TODO: validate uid from auth
    await this.findOne({ uid: cid }, { shouldBeElderly: false })
    const elderly = await this.findOne(
      { uid: eid },
      { relations: ['takenCareBy'], shouldBeElderly: true, shouldExist: true }
    )
    const newCaretakers = elderly.takenCareBy.filter((c) => c.uid !== cid)
    return await this.userRepository.save({ uid: elderly.uid, ...elderly, takenCareBy: newCaretakers })
  }
  async findCaretakerByElderlyId(uid: number) {
    const elderly = await this.findOne(
      { uid: uid },
      { relations: ['takenCareBy'], shouldBeElderly: true, shouldExist: true }
    )
    return elderly.takenCareBy
  }
  async findElderlyByCaretakerId(uid: number) {
    const caretaker = await this.findOne(
      { uid: uid },
      { relations: ['takingCareOf'], shouldBeElderly: false, shouldExist: true }
    )
    return caretaker.takingCareOf
  }
  async createUser(dto: CreateUserDto) {
    const existingUser = await this.findOne({ phone: dto.phone })
    if (existingUser) throw new DuplicateElementException('Phone number')
    const userInfo = this.dtoToSchema(dto)
    const user = this.userRepository.create({
      ...userInfo,
      reminders: [],
      emotionalRecords: [],
      memoryPracticeQuestions: [],
      healthRecords: [],
      modules: [],
      takingCareOf: [],
      takenCareBy: [],
    })
    return await this.userRepository.insert(user)
  }
  async updateUser({ uid, ...newInfo }: UpdateUserDto) {
    const { uid: foundUid } = await this.findOne({ uid: uid }, { shouldExist: true })
    return await this.userRepository.save({
      uid: foundUid,
      ...this.dtoToSchema(newInfo),
    })
  }
}
