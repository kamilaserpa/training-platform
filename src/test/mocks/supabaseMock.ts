import { vi } from 'vitest';

export type SupabaseFilter =
  | { type: 'eq'; column: string; value: unknown }
  | { type: 'in'; column: string; values: unknown[] }
  | { type: 'or'; expression: string }

export type SupabaseQuery = {
  table: string
  op: 'select' | 'insert' | 'update' | 'delete'
  select?: unknown
  payload?: unknown
  filters: SupabaseFilter[]
  order?: { column: string; options?: unknown }
  single?: boolean
}

export type SupabaseResult<TData = any> = {
  data: TData
  error: any
}

export type SupabaseQueryHandler = (query: SupabaseQuery) =>
  | SupabaseResult
  | Promise<SupabaseResult>

const defaultQueryHandler: SupabaseQueryHandler = async () => ({
  data: null,
  error: null,
})

class QueryBuilder {
  private readonly table: string
  private readonly getHandler: () => SupabaseQueryHandler

  private op: SupabaseQuery['op'] = 'select'
  private selectValue: SupabaseQuery['select']
  private payloadValue: SupabaseQuery['payload']
  private filtersValue: SupabaseFilter[] = []
  private orderValue: SupabaseQuery['order']
  private singleValue = false

  constructor(table: string, getHandler: () => SupabaseQueryHandler) {
    this.table = table
    this.getHandler = getHandler
  }

  select(value?: any) {
    this.selectValue = value
    return this
  }

  insert(value: any) {
    this.op = 'insert'
    this.payloadValue = value
    return this
  }

  update(value: any) {
    this.op = 'update'
    this.payloadValue = value
    return this
  }

  delete() {
    this.op = 'delete'
    return this
  }

  eq(column: string, value: unknown) {
    this.filtersValue.push({ type: 'eq', column, value })
    return this
  }

  ['in'](column: string, values: unknown[]) {
    this.filtersValue.push({ type: 'in', column, values })
    return this
  }

  or(expression: string) {
    this.filtersValue.push({ type: 'or', expression })
    return this
  }

  order(column: string, options?: unknown) {
    this.orderValue = { column, options }
    return this
  }

  single() {
    this.singleValue = true
    return this
  }

  // Supabase-js chain helpers we don't care about in tests
  overrideTypes() {
    return this
  }

  private async execute(): Promise<SupabaseResult> {
    const handler = this.getHandler()
    return await handler({
      table: this.table,
      op: this.op,
      select: this.selectValue,
      payload: this.payloadValue,
      filters: this.filtersValue,
      order: this.orderValue,
      single: this.singleValue,
    })
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: SupabaseResult) => TResult1 | Promise<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled as any, onrejected as any)
  }
}

function createSupabaseClientMock() {
  let queryHandler: SupabaseQueryHandler = defaultQueryHandler

  const authGetUser = vi.fn(async () => ({
    data: { user: { id: 'user-1' } as any },
    error: null as any,
  }))

  const authGetSession = vi.fn(async () => ({
    data: { session: { user: { id: 'user-1' } as any } as any },
    error: null as any,
  }))

  const client = {
    auth: {
      getUser: authGetUser,
      getSession: authGetSession,
    },
    from: vi.fn((table: string) => new QueryBuilder(table, () => queryHandler)),
  }

  const setQueryHandler = (handler: SupabaseQueryHandler) => {
    queryHandler = handler
  }

  const setAuthUser = (user: any | null) => {
    authGetUser.mockResolvedValue({ data: { user }, error: null })

    const session = user ? ({ user } as any) : null
    authGetSession.mockResolvedValue({ data: { session }, error: null })
  }

  const setAuthError = (error: any) => {
    authGetUser.mockResolvedValue({ data: { user: null as any }, error })
    authGetSession.mockResolvedValue({ data: { session: null as any }, error })
  }

  const reset = () => {
    authGetUser.mockReset()
    authGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } as any },
      error: null as any,
    })

    authGetSession.mockReset()
    authGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } as any } as any },
      error: null as any,
    })

    client.from.mockClear()
    queryHandler = defaultQueryHandler
  }

  return {
    client,
    authGetUser,
    authGetSession,
    setQueryHandler,
    setAuthUser,
    setAuthError,
    reset,
  }
}

export const supabaseMock = createSupabaseClientMock()
