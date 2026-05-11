import axiosInstance from './axiosConfig';
import { secureStorage } from '@/lib/secureStorage';

export type ConnectionStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

export const getConnectionStatus = async (supplierId: string): Promise<ConnectionStatus> => {
  try {
    const retailerId = await secureStorage.getItem('userId');
    const res = await axiosInstance.get('/api/connections/status', {
      params: { retailerId, supplierId },
    });
    return (res?.data?.status as ConnectionStatus) ?? 'NONE';
  } catch {
    return 'NONE';
  }
};

export const sendConnectionRequest = async (supplierId: string): Promise<void> => {
  const retailerId = await secureStorage.getItem('userId');
  await axiosInstance.post('/api/connections/connect', null, {
    params: { retailerId, supplierId },
  });
};

export const cancelConnectionRequest = async (supplierId: string): Promise<void> => {
  const retailerId = await secureStorage.getItem('userId');
  await axiosInstance.delete('/api/connections/cancel', {
    params: { retailerId, supplierId },
  });
};