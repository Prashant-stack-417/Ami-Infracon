import React, { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProvider, useUserContext } from '../../../Frontend/src/app/UserContext';
import apiClient from '../../../Frontend/src/utils/apiClient';

vi.mock('../../../Frontend/src/utils/apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const ProtectedRouteMock = () => {
  const { hydrate, user } = useUserContext();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return React.createElement('div', null, user ? `User: ${user.name}` : 'No User');
};

describe('UserContext and ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('hydrate function is stable and does not cause infinite loops', async () => {
    localStorage.setItem('zwb_user_store', JSON.stringify({ user: { _id: '1', name: 'Test' } }));

    apiClient.post.mockResolvedValue({ data: { success: true } });
    apiClient.get.mockResolvedValue({ data: { data: { user: { _id: '1', name: 'Test Hydrated', updatedAt: 'now' } } } });

    render(
      React.createElement(UserProvider, null, 
        React.createElement(ProtectedRouteMock, null)
      )
    );

    // Wait for hydration to complete
    await waitFor(() => {
      expect(screen.getByText('User: Test Hydrated')).toBeTruthy();
    });

    // We should only call post/get once (during the initial hydrate call)
    // plus maybe once for the initial load if the context calls it automatically,
    // but certainly not hundreds of times.
    await new Promise(resolve => setTimeout(resolve, 100)); // wait a bit to catch loops

    expect(apiClient.post).toHaveBeenCalledTimes(2);
    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });
});
