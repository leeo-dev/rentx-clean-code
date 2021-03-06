import { DbCreateAccount } from '@/data/usecases/db-create-account'
import { mockLoadAccountByEmailRepository, mockAccountParam, mockAccount, mockCreateAccountRepository } from '@/../__mocks__/mock-account'
import { LoadAccountByEmailRepository } from '@/data/protocols/load-account-by-email-repository'
import { CreateAccountRepository } from '@/data/protocols/create-account-repository'
import { mockError } from '@/../__mocks__/mockError'
import mockDate from 'mockdate'

type SutTypes = {
  sut: DbCreateAccount
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  createAccountRepositoryStub: CreateAccountRepository
}

const makeSut = (): SutTypes => {
  const createAccountRepositoryStub = mockCreateAccountRepository()
  const loadAccountByEmailRepositoryStub = mockLoadAccountByEmailRepository()
  const sut = new DbCreateAccount(loadAccountByEmailRepositoryStub, createAccountRepositoryStub)
  return { sut, loadAccountByEmailRepositoryStub, createAccountRepositoryStub }
}

describe('DbCreateAccount', () => {
  beforeAll(async () => {
    mockDate.set(new Date())
  })
  afterAll(async () => {
    mockDate.reset()
  })
  test('should call loadByEmail with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
    await sut.create(mockAccountParam())
    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
  test('should return an account if loadByEmail returns an account', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(Promise.resolve(mockAccount()))
    const isAccountInUse = await sut.create(mockAccountParam())
    expect(isAccountInUse).toEqual(mockAccount())
  })
  test('should throw if LoadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockImplementationOnce(mockError)
    const promise = sut.create(mockAccountParam())
    await expect(promise).rejects.toThrow()
  })
  test('should call CreateAccountRepository with correct values', async () => {
    const { sut, createAccountRepositoryStub } = makeSut()
    const createSpy = jest.spyOn(createAccountRepositoryStub, 'create')
    await sut.create(mockAccountParam())
    expect(createSpy).toHaveBeenCalledWith(mockAccountParam())
  })
  test('should throw if CreateAccountRepository throws', async () => {
    const { sut, createAccountRepositoryStub } = makeSut()
    jest.spyOn(createAccountRepositoryStub, 'create').mockImplementationOnce(mockError)
    const promise = sut.create(mockAccountParam())
    await expect(promise).rejects.toThrow()
  })
})
