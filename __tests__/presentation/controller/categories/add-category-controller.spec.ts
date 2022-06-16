import { mockAddCategory, mockCategory } from '@/../__mocks__/mock-categories'
import { AddCategory } from '@/domain/protocols/add-category'
import { AddCategoryController } from '@/presentation/controllers/categories/add-category-controller'
import { AlreadyInUseError, MissingParamError } from '@/presentation/error'
import { badRequest, forbidden, serverError } from '@/presentation/helpers/http-helper'

type SutTypes = {
  sut: AddCategoryController
  addCategoryStub: AddCategory
}

const makeSut = (): SutTypes => {
  const addCategoryStub = mockAddCategory()
  const sut = new AddCategoryController(addCategoryStub)
  return { sut, addCategoryStub }
}

describe('Add Category Controller', () => {
  test('should return 400 if no name is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        description: 'any_description'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new MissingParamError('name')))
  })
  test('should return 400 if no description is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new MissingParamError('description')))
  })
  test('should call AddCategory with correct values', async () => {
    const { sut, addCategoryStub } = makeSut()
    const addSpy = jest.spyOn(addCategoryStub, 'add')
    const httpRequest = {
      body: {
        name: 'any_name',
        description: 'any_description'
      }
    }
    await sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      description: 'any_description'
    })
  })
  test('should return 500 if AddCategory throw', async () => {
    const { sut, addCategoryStub } = makeSut()
    jest.spyOn(addCategoryStub, 'add').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        name: 'any_name',
        description: 'any_description'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(serverError(new Error()))
  })
  test('should return 403 is category is already in use', async () => {
    const { sut, addCategoryStub } = makeSut()
    jest.spyOn(addCategoryStub, 'add').mockReturnValueOnce(Promise.resolve(mockCategory()))
    const httpRequest = {
      body: {
        name: 'any_name',
        description: 'any_description'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(forbidden(new AlreadyInUseError('Category')))
  })
})
