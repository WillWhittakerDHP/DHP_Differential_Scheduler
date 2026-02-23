
export interface UsePartInstanceDeletionReturn {
  handleDeletePartInstance: (id: string) => void
}

export function usePartInstanceDeletion(): UsePartInstanceDeletionReturn {
  const handleDeletePartInstance = (_id: string): void => {
  }

  return {
    handleDeletePartInstance
  }
}
