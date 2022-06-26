import { LoadAccountByEmailRepository } from './../protocols/load-account-by-email-repository'
import { Account } from '@/domain/models/account'
import { AccountParam, CreateAccount } from '@/domain/protocols/create-account'
export class DbCreateAccount implements CreateAccount {
  constructor (private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository) {}
  async create (accountParam: AccountParam): Promise<Account | null> {
    const { email } = accountParam
    const account = await this.loadAccountByEmailRepository.loadByEmail(email)
    if (account) return account
    return null
  }
}
