import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { MockType, repositoryMockFactory } from '../utils/mock.repository'
import { EntitySchema, Repository } from 'typeorm'
import { DuplicateRelationshipException, InvalidUserTypeException, UserNotFoundException } from './user.exception'
import { UserService } from './user.service'
import { resolveSoa } from 'dns'
describe('UserService', () => {
  let service: UserService
  let repositoryMock: MockType<Repository<User>>
  const mockElderly = [
    { uid: 1, fname: 'Khunyai', lname: 'Jaidee', dname: 'Yai', is_elderly: true, taken_care_by: [] },
    { uid: 2, fname: 'Khunta', lname: 'Jaiyen', dname: 'Ta', is_elderly: true, taken_care_by: [] },
    { uid: 5, fname: 'Khunya', lname: 'Jailom', dname: 'Ma', is_elderly: true, taken_care_by: [] },
  ]
  const mockCaretakers = [
    { uid: 3, fname: 'Aunty', lname: 'Ann', dname: 'Ann', is_elderly: false, taking_care_of: [] },
    { uid: 4, fname: 'Uncle', lname: 'Ben', dname: 'Ben', is_elderly: false, taking_care_of: [] },
  ]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: getRepositoryToken(User), useFactory: repositoryMockFactory }],
    }).compile()
    service = module.get<UserService>(UserService)
    repositoryMock = module.get(getRepositoryToken(User))
  })
  describe('findOne', () => {
    it('should return user when user is found and pass type constraint', async () => {
      repositoryMock.findOne.mockReturnValue(mockElderly[0])
      await expect(service.findOne({ uid: mockElderly[0].uid })).resolves.toBe(mockElderly[0])
      expect(repositoryMock.findOne).toHaveBeenCalledWith({ uid: mockElderly[0].uid }, undefined)

      repositoryMock.findOne.mockReturnValue(mockCaretakers[0])
      await expect(service.findOne({ uid: mockCaretakers[0].uid })).resolves.toBe(mockCaretakers[0])
      expect(repositoryMock.findOne).toHaveBeenCalledWith({ uid: mockCaretakers[0].uid }, undefined)

      repositoryMock.findOne.mockReturnValue(mockElderly[1])
      await expect(service.findOne({ uid: mockElderly[1].uid }, { shouldBeElderly: true })).resolves.toBe(
        mockElderly[1]
      )
      expect(repositoryMock.findOne).toHaveBeenCalledWith({ uid: mockElderly[1].uid }, { shouldBeElderly: true })
    })
    it('should throw user not found exception when user is not found', async () => {
      repositoryMock.findOne.mockReturnValue(undefined)
      await expect(service.findOne({ uid: mockElderly[0].uid })).rejects.toThrowError(UserNotFoundException)
      expect(repositoryMock.findOne).toHaveBeenCalledWith({ uid: mockElderly[0].uid }, undefined)
    })
    it('should throw invalid user type exception when user does not pass type constraint', async () => {
      repositoryMock.findOne.mockReturnValue(mockElderly[0])
      await expect(service.findOne({ uid: mockElderly[0].uid }, { shouldBeElderly: false })).rejects.toThrowError(
        InvalidUserTypeException
      )
      expect(repositoryMock.findOne).toHaveBeenCalledWith({ uid: mockElderly[0].uid }, { shouldBeElderly: false })

      repositoryMock.findOne.mockReturnValue(mockCaretakers[0])
      await expect(service.findOne({ uid: mockCaretakers[0].uid }, { shouldBeElderly: true })).rejects.toThrowError(
        InvalidUserTypeException
      )
      expect(repositoryMock.findOne).toHaveBeenCalledWith({ uid: mockCaretakers[0].uid }, { shouldBeElderly: true })
    })
  })
  describe('addRelationship', () => {
    beforeEach(() => {
      mockElderly[0].taken_care_by = [mockCaretakers[0], mockCaretakers[1]]
      mockElderly[1].taken_care_by = [mockCaretakers[0]]
      mockElderly[2].taken_care_by = []
      mockCaretakers[0].taking_care_of = [mockElderly[0], mockElderly[1]]
      mockCaretakers[1].taking_care_of = [mockElderly[0]]
    })
    it('should return updated elderly when input is valid', async () => {
      repositoryMock.findOne.mockReturnValueOnce(mockCaretakers[0])
      repositoryMock.findOne.mockReturnValueOnce(mockElderly[2])
      repositoryMock.save.mockReturnValueOnce(true)
      await expect(
        service.addRelationship({ eid: mockElderly[2].uid, cid: mockCaretakers[0].uid })
      ).resolves.toBeTruthy()
    })
    it('should throw dupliate relationship error when elderly is already taken care by the caretaker', async () => {
      repositoryMock.findOne.mockReturnValueOnce(mockCaretakers[0])
      repositoryMock.findOne.mockReturnValueOnce(mockElderly[0])
      repositoryMock.save.mockReturnValueOnce(true)
      await expect(
        service.addRelationship({ eid: mockElderly[0].uid, cid: mockCaretakers[0].uid })
      ).rejects.toThrowError(DuplicateRelationshipException)
    })
  })
})
