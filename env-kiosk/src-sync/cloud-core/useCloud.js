import { useContext } from 'react';
import CloudContext from './CloudContext';

export default function useCloudContext() {
  return useContext(CloudContext);
}
