import { LayoutDashboard, PlusSquare, FolderOpen, MessageSquare, User } from 'lucide-react';
import RoleDashboardLayout from '../shared/RoleDashboardLayout';

const links = [
  { to: '/client/dashboard', label: 'Browse Talent', icon: LayoutDashboard },
  { to: '/client/post-project', label: 'Post Project', icon: PlusSquare },
  { to: '/client/my-projects', label: 'My Projects', icon: FolderOpen },
  { to: '/client/messages', label: 'Messages', icon: MessageSquare },
  { to: '/client/profile', label: 'My Profile', icon: User },
];

export default function ClientLayout() {
  return <RoleDashboardLayout title="Client" links={links} />;
}
