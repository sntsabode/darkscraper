import inquirer from 'inquirer'

export interface IPromptType {
  confirm: boolean
  number: number
  input: string
}

export async function prompt<T extends keyof IPromptType>(
  type: T,
  msg: string
): Promise<IPromptType[T]> {
  const { val } = await inquirer.prompt({
    name: 'val',
    type: type,
    message: msg
  })

  return val
}
