import { db } from '../db';
import type { User, UserPreferences } from '@teach/shared';
import { DEFAULT_USER_PREFERENCES } from '@teach/shared';

/**
 * Get the current user (single anonymous user)
 * Creates a default user if none exists
 */
export async function getUser(): Promise<User> {
  const users = await db.users.toArray();

  if (users.length === 0) {
    // Create default anonymous user
    const newUser: User = {
      id: crypto.randomUUID(),
      currentLevel: 'A1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      preferences: { ...DEFAULT_USER_PREFERENCES },
    };

    await db.users.add(newUser);
    return newUser;
  }

  return users[0];
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<void> {
  await db.users.update(userId, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  const user = await db.users.get(userId);
  if (!user) throw new Error('User not found');

  await db.users.update(userId, {
    preferences: { ...user.preferences, ...preferences },
    updatedAt: Date.now(),
  });
}

/**
 * Update user's current CEFR level
 */
export async function updateUserLevel(
  userId: string,
  level: User['currentLevel']
): Promise<void> {
  await db.users.update(userId, {
    currentLevel: level,
    updatedAt: Date.now(),
  });
}
