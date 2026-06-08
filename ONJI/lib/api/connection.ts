import axiosInstance from './axiosConfig';
import { secureStorage } from '@/lib/secureStorage';

export type ConnectionStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RECEIVED_PENDING';

export const getConnectionStatus = async (supplierId: string): Promise<ConnectionStatus> => {
  try {
    const retailerId = await secureStorage.getItem('userId');
    const res = await axiosInstance.get('/api/connections/status', {
      params: { retailerId, supplierId },
    });
    const status = res?.data?.status;
    const initiatedBy = res?.data?.initiatedBy;
    if (status === 'PENDING' && initiatedBy === 'SUPPLIER') {
      return 'RECEIVED_PENDING';
    }
    return (status as ConnectionStatus) ?? 'NONE';
  } catch {
    return 'NONE';
  }
};

export const sendConnectionRequest = async (supplierId: string): Promise<void> => {
  const retailerId = await secureStorage.getItem('userId');
  await axiosInstance.post('/api/connections/connect', null, {
    params: { retailerId, supplierId, initiatedBy: 'RETAILER' },
  });
};

export const cancelConnectionRequest = async (supplierId: string): Promise<void> => {
  const retailerId = await secureStorage.getItem('userId');
  await axiosInstance.delete('/api/connections/cancel', {
    params: { retailerId, supplierId },
  });
};