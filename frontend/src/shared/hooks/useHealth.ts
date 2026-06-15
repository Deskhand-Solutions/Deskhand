import { useQuery } from '@tanstack/react-query'
import { fetchHealth, fetchPlatformInfo } from '../api/health'

export const useHealth = () =>
  useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  })

export const usePlatformInfo = () =>
  useQuery({
    queryKey: ['platform-info'],
    queryFn: fetchPlatformInfo,
  })
