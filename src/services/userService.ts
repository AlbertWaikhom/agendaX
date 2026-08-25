import { LocalUser } from '../types';
import { generateWorkspaceId } from '../utils';

const AvatarColors = [
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
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
