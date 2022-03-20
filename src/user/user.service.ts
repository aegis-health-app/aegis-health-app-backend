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
      ((user.is_elderly && !options.shouldBeElderly) || (!user.is_elderly && options.shouldBeElderly))
    )
      throw new InvalidUserTypeException()
    return user
  }
  async addRelationship({ eid, cid }: UpdateRelationshipDto) {
    //TODO: validate uid from auth
    const caretaker = await this.findOne({ uid: cid }, { shouldBeElderly: false })
    const elderly = await this.findOne({ uid: eid }, { relations: ['taken_care_by'], shouldBeElderly: true })
    if (elderly.taken_care_by.find((currentCaretaker) => currentCaretaker.uid === cid))
      throw new DuplicateRelationshipException()
    elderly.taken_care_by.push(caretaker)
    return await this.userRepository.save(elderly)
  }
  async removeRelationship({ eid, cid }: UpdateRelationshipDto) {
    //TODO: validate uid from auth
    await this.findOne({ uid: cid }, { shouldBeElderly: false })
    const elderly = await this.findOne({ uid: eid }, { relations: ['taken_care_by'], shouldBeElderly: true })
    elderly.taken_care_by = elderly.taken_care_by.filter((c) => c.uid !== cid)
    return await this.userRepository.save(elderly)
  }
  async findCaretakerByElderlyId(eid: number) {
    const elderly = await this.findOne({ uid: eid }, { relations: ['taken_care_by'], shouldBeElderly: true })
    return elderly.taken_care_by
  }
  async findElderlyByCaretakerId(cid: number) {
    const caretaker = await this.findOne({ uid: cid }, { relations: ['taking_care_of'], shouldBeElderly: false })
    return caretaker.taking_care_of
  }
}
