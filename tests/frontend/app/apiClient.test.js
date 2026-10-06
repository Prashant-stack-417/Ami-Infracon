import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../Frontend/src/utils/apiClient';
import { API_CONFIG } from '../../../Frontend/src/config/constants';

describe('apiClient Admin Refresh', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('window', { location: { pathname: '/admin/dashboard' } });
  });

  it('transparently refreshes admin token and retries request', async () => {
    // 1st call to endpoint: returns 401
    // 2nd call to /refresh-token: returns 200
    // 3rd call to endpoint: returns 200 with data
    global.fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Token Expired' })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: 'Success!' })
      });

    const res = await apiClient.get('/admin/stats');
    
    expect(res.data).toEqual({ data: 'Success!' });
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(global.fetch.mock.calls[0][0]).toContain('/admin/stats');
    expect(global.fetch.mock.calls[1][0]).toContain('/admin/refresh-token');
    expect(global.fetch.mock.calls[2][0]).toContain('/admin/stats');
  });
});
