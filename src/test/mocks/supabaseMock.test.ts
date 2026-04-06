import { beforeEach, describe, expect, it } from 'vitest';
import { supabaseMock, type SupabaseQuery } from './supabaseMock';

/**
 * Testes para supabaseMock com suporte a maybeSingle e resultMode
 */

describe('supabaseMock - Query Builder', () => {
  beforeEach(() => {
    supabaseMock.reset();
  });

  it('constrói query com select básico', () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: null, error: null };
    });

    const builder = supabaseMock.client.from('users');
    builder.select('id,name');

    expect(queries.length).toBe(0); // Não executa até .then
  });

  it('suporta single() para resultado único', async () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: { id: '1', name: 'Test' }, error: null };
    });

    const result = await (supabaseMock.client
      .from('users')
      .select('*')
      .eq('id', '1')
      .single() as any);

    expect(result.data).toBeDefined();
    expect(queries[0].resultMode).toBe('single');
    expect(queries[0].single).toBe(true);
  });

  it('suporta maybeSingle() para resultado único ou null', async () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: null, error: null };
    });

    const result = await (supabaseMock.client
      .from('training_weeks')
      .select('*')
      .eq('start_date', '2026-02-02')
      .maybeSingle() as any);

    expect(result.data).toBeNull();
    expect(queries[0].resultMode).toBe('maybeSingle');
    expect(queries[0].single).toBe(true);
  });

  it('resultMode defaults to "many" sem single/maybeSingle', async () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: [], error: null };
    });

    const result = await (supabaseMock.client
      .from('exercises')
      .select('*') as any);

    expect(Array.isArray(result.data)).toBe(true);
    expect(queries[0].resultMode).toBe('many');
    expect(queries[0].single).toBe(false);
  });

  it('eq filter adiciona condição ao query', async () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: null, error: null };
    });

    await (supabaseMock.client
      .from('users')
      .select('*')
      .eq('id', '123') as any);

    expect(queries[0].filters).toHaveLength(1);
    expect(queries[0].filters[0]). toEqual({
      type: 'eq',
      column: 'id',
      value: '123',
    });
  });

  it('in filter para múltiplos valores', async () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: [], error: null };
    });

    await (supabaseMock.client
      .from('exercises')
      .select('*')
      ['in']('id', ['ex1', 'ex2', 'ex3']) as any);

    expect(queries[0].filters[0]).toEqual({
      type: 'in',
      column: 'id',
      values: ['ex1', 'ex2', 'ex3'],
    });
  });

  it('múltiplos filters podem ser combinados', async () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: [], error: null };
    });

    await (supabaseMock.client
      .from('trainings')
      .select('*')
      .eq('training_week_id', 'w1')
      .eq('created_by', 'user1') as any);

    expect(queries[0].filters).toHaveLength(2);
  });

  it('overrideTypes() passthrough (tipo de helper)', async () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: null, error: null };
    });

    const result = await (supabaseMock.client
      .from('users')
      .select('*')
      .overrideTypes() as any);

    expect(queries).toHaveLength(1);
  });

  it('order() adiciona ordenação ao query', async () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: [], error: null };
    });

    await (supabaseMock.client
      .from('exercises')
      .select('*')
      .order('name', { ascending: true }) as any);

    expect(queries[0].order).toEqual({
      column: 'name',
      options: { ascending: true },
    });
  });

  it('insert() opera muda para insert', async () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: { id: '1' }, error: null };
    });

    const data = { name: 'New User' };
    await (supabaseMock.client
      .from('users')
      .insert(data) as any);

    expect(queries[0].op).toBe('insert');
    expect(queries[0].payload).toEqual(data);
  });

  it('update() opera muda para update', async () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: { id: '1' }, error: null };
    });

    const data = { name: 'Updated' };
    await (supabaseMock.client
      .from('users')
      .eq('id', '1')
      .update(data) as any);

    expect(queries[0].op).toBe('update');
    expect(queries[0].payload).toEqual(data);
  });

  it('delete() opera muda para delete', async () => {
    const queries: SupabaseQuery[] = [];
    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      return { data: null, error: null };
    });

    await (supabaseMock.client
      .from('users')
      .eq('id', '1')
      .delete() as any);

    expect(queries[0].op).toBe('delete');
  });
});

describe('supabaseMock - RPC', () => {
  beforeEach(() => {
    supabaseMock.reset();
  });

  it('rpc() registra chamadas no array rpcCalls', async () => {
    const result = await supabaseMock.client.rpc('test_function', { arg1: 'value' });

    expect(supabaseMock.rpcCalls).toHaveLength(1);
    expect(supabaseMock.rpcCalls[0].name).toBe('test_function');
    expect(supabaseMock.rpcCalls[0].args).toEqual({ arg1: 'value' });
  });

  it('rpc() retorna default { data: null, error: null } sem customização', async () => {
    const result = await supabaseMock.client.rpc('any_function');

    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });

  it('rpc() pode ser mockado para retornar dados customizados', async () => {
    const mockRpc = vi.spyOn(supabaseMock.client, 'rpc' as any).mockResolvedValueOnce({
      data: 'training-id-123',
      error: null,
    });

    const result = await supabaseMock.client.rpc('create_training_with_week', {
      p_name: 'Treino',
      p_scheduled_date: '2026-02-06',
    });

    expect(result.data).toBe('training-id-123');
  });

  it('rpcCalls limpo ao chamar reset()', async () => {
    await supabaseMock.client.rpc('call1');
    await supabaseMock.client.rpc('call2');

    expect(supabaseMock.rpcCalls).toHaveLength(2);

    supabaseMock.reset();

    expect(supabaseMock.rpcCalls).toHaveLength(0);
  });
});

describe('supabaseMock - Auth', () => {
  beforeEach(() => {
    supabaseMock.reset();
  });

  it('getUser retorna mocked user por padrão', async () => {
    const result = await supabaseMock.client.auth.getUser();

    expect(result.data.user).toBeDefined();
    expect(result.data.user.id).toBe('user-1');
    expect(result.error).toBeNull();
  });

  it('getSession retorna mocked session por padrão', async () => {
    const result = await supabaseMock.client.auth.getSession();

    expect(result.data.session).toBeDefined();
    expect(result.data.session.user.id).toBe('user-1');
    expect(result.error).toBeNull();
  });

  it('setAuthUser() customiza user/session retornados', async () => {
    supabaseMock.setAuthUser({ id: 'custom-user' });

    const userResult = await supabaseMock.client.auth.getUser();
    const sessionResult = await supabaseMock.client.auth.getSession();

    expect(userResult.data.user.id).toBe('custom-user');
    expect(sessionResult.data.session.user.id).toBe('custom-user');
  });

  it('setAuthUser(null) simula usuário não autenticado', async () => {
    supabaseMock.setAuthUser(null);

    const userResult = await supabaseMock.client.auth.getUser();
    const sessionResult = await supabaseMock.client.auth.getSession();

    expect(userResult.data.user).toBeNull();
    expect(sessionResult.data.session).toBeNull();
  });

  it('setAuthError() simula erro de autenticação', async () => {
    const authError = new Error('Sessão expirada');
    supabaseMock.setAuthError(authError);

    const userResult = await supabaseMock.client.auth.getUser();
    const sessionResult = await supabaseMock.client.auth.getSession();

    expect(userResult.error).toEqual(authError);
    expect(sessionResult.error).toEqual(authError);
  });

  it('reset() restaura auth ao estado padrão', async () => {
    supabaseMock.setAuthUser(null);
    supabaseMock.reset();

    const userResult = await supabaseMock.client.auth.getUser();
    expect(userResult.data.user.id).toBe('user-1');
  });
});

describe('supabaseMock - Query Handler Customizado', () => {
  beforeEach(() => {
    supabaseMock.reset();
  });

  it('setQueryHandler permite handler customizado', async () => {
    supabaseMock.setQueryHandler(async (q) => {
      if (q.table === 'custom_table') {
        return { data: { custom: true }, error: null };
      }
      return { data: null, error: null };
    });

    const result = await (supabaseMock.client
      .from('custom_table')
      .select('*') as any);

    expect(result.data.custom).toBe(true);
  });

  it('handler pode acessar query details (filters, op, etc)', async () => {
    let capturedQuery: SupabaseQuery | null = null;

    supabaseMock.setQueryHandler(async (q) => {
      capturedQuery = q;
      return { data: null, error: null };
    });

    await (supabaseMock.client
      .from('users')
      .select('id,name')
      .eq('id', '123')
      .single() as any);

    expect(capturedQuery!.table).toBe('users');
    expect(capturedQuery!.select).toBe('id,name');
    expect(capturedQuery!.resultMode).toBe('single');
    expect((capturedQuery!.filters[0] as Extract<SupabaseQuery['filters'][0], { type: 'eq' }>).column).toBe('id');
  });

  it('handler pode retornar Promise<SupabaseResult>', async () => {
    supabaseMock.setQueryHandler(async (q) => {
      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: [{ id: '1' }, { id: '2' }], error: null };
    });

    const result = await (supabaseMock.client
      .from('items')
      .select('*') as any);

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data).toHaveLength(2);
  });
});

describe('supabaseMock - Integração com testes reais', () => {
  beforeEach(() => {
    supabaseMock.reset();
  });

  it('simula fluxo completo: select → insert → update', async () => {
    const queries: SupabaseQuery[] = [];

    supabaseMock.setQueryHandler(async (q) => {
      queries.push(q);
      if (q.op === 'select') {
        return { data: [], error: null };
      }
      if (q.op === 'insert') {
        return { data: { id: 'new-1' }, error: null };
      }
      if (q.op === 'update') {
        return { data: { id: 'new-1', updated: true }, error: null };
      }
      return { data: null, error: null };
    });

    // Select
    const selectResult = await (supabaseMock.client
      .from('items')
      .select('*') as any);
    expect(selectResult.data).toEqual([]);

    // Insert
    const insertResult = await (supabaseMock.client
      .from('items')
      .insert({ name: 'New' }) as any);
    expect(insertResult.data.id).toBe('new-1');

    // Update
    const updateResult = await (supabaseMock.client
      .from('items')
      .eq('id', 'new-1')
      .update({ name: 'Updated' }) as any);
    expect(updateResult.data.updated).toBe(true);

    expect(queries).toHaveLength(3);
    expect(queries[0].op).toBe('select');
    expect(queries[1].op).toBe('insert');
    expect(queries[2].op).toBe('update');
  });
});

// Importar vi onde necessário
import { vi } from 'vitest';
