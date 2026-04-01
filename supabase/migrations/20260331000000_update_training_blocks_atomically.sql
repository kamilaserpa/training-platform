-- Criação de tipos auxiliares para atualização atômica de blocos de treino
create type if not exists public.training_block_exercise_input as (
  exercise_id uuid,
  video_id uuid,
  sets integer,
  reps text,
  duration_seconds integer,
  rest_seconds integer,
  weight_kg numeric(5,2),
  notes text
);

create type if not exists public.training_block_input as (
  name text,
  block_type public.block_type,
  order_index integer,
  rest_between_exercises_seconds integer,
  exercises training_block_exercise_input[]
);

-- Função RPC para atualizar blocos de treino de forma atômica
create or replace function public.update_training_blocks_atomically(
  p_training_id uuid,
  p_blocks public.training_block_input[]
)
returns void
language plpgsql
as $$
declare
  v_block public.training_block_input;
  v_ex training_block_exercise_input;
  v_block_id uuid;
  v_controlled_block_ids uuid[];
begin
  -- Descobrir blocos "controlados pela UI" para esse treino
  select array_agg(id)
  into v_controlled_block_ids
  from training_blocks
  where training_id = p_training_id
    and (
      block_type in ('MOBILIDADE_ARTICULAR','ATIVACAO_CORE','ATIVACAO_NEURAL','CONDICIONAMENTO_FISICO')
      or (block_type = 'TREINO_PRINCIPAL' and order_index in (4,5))
    );

  if v_controlled_block_ids is not null and array_length(v_controlled_block_ids, 1) > 0 then
    -- 1) Remover prescriptions dos blocos controlados
    delete from exercise_prescriptions
    where training_block_id = any (v_controlled_block_ids);

    -- 2) Remover blocos controlados
    delete from training_blocks
    where id = any (v_controlled_block_ids);
  end if;

  -- 3) Recriar blocos e prescriptions a partir de p_blocks
  foreach v_block in array p_blocks loop
    insert into training_blocks (
      training_id,
      name,
      block_type,
      order_index,
      rest_between_exercises_seconds
    )
    values (
      p_training_id,
      v_block.name,
      v_block.block_type,
      v_block.order_index,
      coalesce(v_block.rest_between_exercises_seconds, 60)
    )
    returning id into v_block_id;

    if v_block.exercises is not null then
      for i in 1..array_length(v_block.exercises, 1) loop
        v_ex := v_block.exercises[i];

        insert into exercise_prescriptions (
          training_block_id,
          exercise_id,
          video_id,
          order_index,
          sets,
          reps,
          duration_seconds,
          rest_seconds,
          weight_kg,
          notes
        )
        values (
          v_block_id,
          v_ex.exercise_id,
          v_ex.video_id,
          i,
          coalesce(v_ex.sets, 1),
          v_ex.reps,
          v_ex.duration_seconds,
          coalesce(v_ex.rest_seconds, 0),
          v_ex.weight_kg,
          v_ex.notes
        );
      end loop;
    end if;
  end loop;
end;
$$;

