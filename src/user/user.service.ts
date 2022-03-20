import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { FindConditions, FindOneOptions, Repository } from 'typeorm'
import { UpdateRelationshipDto } from './dto/update-user.dto'
import { DuplicateRelationshipException, InvalidUserTypeException, UserNotFoundException } from './user.exception'

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}
  async findOne(conditions: FindConditions<User>, options?: FindOneOptions<User> & { shouldBeElderly?: boolean }) {
    const user = await this.userRepository.findOne(conditions, options)
    if (!user) throw new UserNotFoundException()
    if (
      options &&
      options.shouldBeElderly !== undefined &&
      ((user.isElderly && !options.shouldBeElderly) || (!user.isElderly && options.shouldBeElderly))
    )
      throw new InvalidUserTypeException()
    return user
  }
  async addRelationship({ eid, cid }: UpdateRelationshipDto) {
    //TODO: validate uid from auth
    const caretaker = await this.findOne({ uid: cid }, { shouldBeElderly: false })
    const elderly = await this.findOne({ uid: eid }, { relations: ['takenCareBy'], shouldBeElderly: true })
    if (elderly.takenCareBy.find((currentCaretaker) => currentCaretaker.uid === cid))
      throw new DuplicateRelationshipException()
    elderly.takenCareBy.push(caretaker)
    return await this.userRepository.save(elderly)
  }
  async removeRelationship({ eid, cid }: UpdateRelationshipDto) {
    //TODO: validate uid from auth
    await this.findOne({ uid: cid }, { shouldBeElderly: false })
    const elderly = await this.findOne({ uid: eid }, { relations: ['takenCareBy'], shouldBeElderly: true })
    elderly.takenCareBy = elderly.takenCareBy.filter((c) => c.uid !== cid)
    return await this.userRepository.save(elderly)
  }
  async findCaretakerByElderlyId(eid: number) {
    const elderly = await this.findOne({ uid: eid }, { relations: ['takenCareBy'], shouldBeElderly: true })
    return elderly.takenCareBy
  }
  async findElderlyByCaretakerId(cid: number) {
    const caretaker = await this.findOne({ uid: cid }, { relations: ['takingCareOf'], shouldBeElderly: false })
    return caretaker.takingCareOf
  }
}
