// Exemplo de treino completo/multi-bloco para DEV MODE
export const treinoMock = {
  id: 'treino-uuid-123',
  data: '2025-05-13',
  semana: {
    id: 'semana-1',
    tipos_treino: { nome: 'Hipertrofia 65%' }
  },
  token_compartilhamento: 'mock-token-123',
  link_active: true,
  link_expires_at: null,
  observacoes: 'Treino para desenvolvimento/tela mock.',
  blocos_treino: [
    {
      id: 'bloco-1',
      tipo_bloco: 'PADRAO_MOVIMENTO',
      ordem: 1,
      prescricao: 'Mobilidade geral e ativação neural para todo o corpo.',
      bloco_padrao_movimento: [
        { padrao_movimento_id: 'pad1', padroes_movimento: { nome: 'DOBRAR E PUXAR H' } }
      ],
      bloco_exercicios: [
        { id: 'be1', ordem: 1, series: 2, repeticoes: '12', carga: 'Corporal', exercicios: { id:'ex1', nome:'Agachamento', grupo_muscular:'Pernas', observacoes:'lento' } }
      ]
    },
    {
      id: 'bloco-2',
      tipo_bloco: 'ATIVACAO_CORE',
      ordem: 2,
      prescricao: 'Ativação intensiva do core',
      bloco_padrao_movimento: [],
      bloco_exercicios: [
        { id: 'be2', ordem: 1, series: 3, repeticoes: '15', carga: '', exercicios: { id:'ex2', nome:'Prancha', grupo_muscular:'Core', observacoes: '' } }
      ]
    },
    {
      id: 'bloco-3',
      tipo_bloco: 'TREINO',
      ordem: 3,
      prescricao: 'Parte principal do treino: foco em força.',
      bloco_padrao_movimento: [],
      bloco_exercicios: [
        { id: 'be3', ordem: 1, series: 4, repeticoes:'8', carga: '12kg', exercicios:{id:'ex3',nome:'Supino',grupo_muscular:'Peito',observacoes:''} },
        { id: 'be4', ordem: 2, series: 4, repeticoes:'10', carga: '8kg', exercicios:{id:'ex4',nome:'Remada',grupo_muscular:'Costas',observacoes:''} }
      ]
    },
    {
      id: 'bloco-4',
      tipo_bloco: 'CONDICIONAMENTO_FISICO',
      ordem: 4,
      prescricao: 'Condicionamento metabólico. 10 min bike.',
      bloco_padrao_movimento: [],
      bloco_exercicios: []
    }
  ]
};