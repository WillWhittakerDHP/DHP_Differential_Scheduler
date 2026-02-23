
export interface UseInstanceDeletionReturn {
  handleDeleteBlockInstance: (id: string) => void
}

export function useInstanceDeletion(): UseInstanceDeletionReturn {
  const handleDeleteBlockInstance = (_id: string): void => {
  }

  return {
    handleDeleteBlockInstance
  }
}
