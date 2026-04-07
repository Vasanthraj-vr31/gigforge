export function getRoleBase(role) {
  return role === 'client' ? '/client/dashboard' : '/freelancer/dashboard';
}

