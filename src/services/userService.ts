import { LocalUser } from '../types';
import { generateWorkspaceId } from '../utils';

const AvatarColors = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
];

export const UserService = {
  createLocalUser(name: string): LocalUser {
    const trimmedName = name.trim() || 'Workspace User';
    const randomColor = AvatarColors[Math.floor(Math.random() * AvatarColors.length)];

    return {
      id: generateWorkspaceId(),
      name: trimmedName,
      avatarColor: randomColor,
      createdAt: new Date().toISOString(),
    };
  },
};
