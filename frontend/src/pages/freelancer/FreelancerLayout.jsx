import { FolderOpen, MessageSquare, User } from 'lucide-react';
import RoleDashboardLayout from '../shared/RoleDashboardLayout';

const links = [
  { to: '/freelancer/projects', label: 'Projects', icon: FolderOpen },
  { to: '/freelancer/messages', label: 'Messages', icon: MessageSquare },
  { to: '/freelancer/profile', label: 'Profile', icon: User },
];

export default function FreelancerLayout() {
  return <RoleDashboardLayout title="Freelancer" links={links} />;
}

