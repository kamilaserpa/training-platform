// Mock user para DEV MODE
export const mockUser = {
  id: 'mock-owner-uuid',
  email: 'owner@mock.com',
  user_metadata: {
    nome: 'Owner Mock'
  }
};

export const mockProfile = {
  user_id: 'mock-owner-uuid',
  role: 'owner',
  active: true
};

// Exports antigos para compatibilidade
export const user = mockUser;
export const profile = mockProfile;