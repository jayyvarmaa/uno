import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import client from './client.js';

describe('client.auth.me', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return the user when logged in', async () => {
    const mockUser = { id: '1', username: 'testuser' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    const user = await client.auth.me();
    expect(user).toEqual(mockUser);
  });

  it('should throw "Not logged in" when not logged in', async () => {
    await expect(client.auth.me()).rejects.toThrow('Not logged in');
  });

  it('should throw "Not logged in" when user data is invalid', async () => {
    localStorage.setItem('user', 'invalid-json');

    // Silence console.error for this test as it logs the parsing error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(client.auth.me()).rejects.toThrow('Not logged in');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('client.auth.isGuest', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return true if user is guest', () => {
    const mockUser = { isGuest: true };
    localStorage.setItem('user', JSON.stringify(mockUser));
    expect(client.auth.isGuest()).toBe(true);
  });

  it('should return false if user is not guest', () => {
    const mockUser = { isGuest: false };
    localStorage.setItem('user', JSON.stringify(mockUser));
    expect(client.auth.isGuest()).toBe(false);
  });

  it('should return false if no user is logged in', () => {
    expect(client.auth.isGuest()).toBe(false);
  });
});
