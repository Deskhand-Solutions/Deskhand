import { useQuery } from '@tanstack/react-query'
import { fetchModuleCatalog } from '../api/modules'

export const useModuleCatalog = () => {
  const query = useQuery({
    queryKey: ['module-catalog'],
    queryFn: fetchModuleCatalog,
  })

  return {
    catalog: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
