import axiosInstance from './axiosConfig';
import { secureStorage } from '@/lib/secureStorage';

export type ConnectionStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

export const getSupplierConnectionStatus = async (
  retailerId: string
): Promise<ConnectionStatus> => {
  try {
    const supplierId = await secureStorage.getItem('userId');

    const res = await axiosInstance.get('/api/connections/status', {
      params: {
        retailerId,
        supplierId,
      },
    });

    return (res?.data?.status as ConnectionStatus) ?? 'NONE';
  } catch {
    return 'NONE';
  }
};

export const sendSupplierConnectionRequest = async (
  retailerId: string
): Promise<void> => {
  const supplierId = await secureStorage.getItem('userId');

  console.log('retailerId:', retailerId);
  console.log('supplierId:', supplierId);
  console.log({
    retailerId,
    supplierId,
  });

  await axiosInstance.post('/api/connections/connect', null, {
    params: {
      retailerId,
      supplierId,
    },
  });
};

export const cancelSupplierConnectionRequest = async (
  retailerId: string
): Promise<void> => {
  const supplierId = await secureStorage.getItem('userId');

  await axiosInstance.delete('/api/connections/cancel', {
    params: {
      retailerId,
      supplierId,
    },
  });
};


