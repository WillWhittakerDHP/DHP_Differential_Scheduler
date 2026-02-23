
export interface UseShapeDeletionReturn {
  handleDeleteBlockShape: (id: string) => void
  handleDeletePartShape: (id: string) => void
  handleDeleteAnnotationShape: (id: string) => void
}

export function useShapeDeletion(): UseShapeDeletionReturn {
  const handleDeleteBlockShape = (_id: string): void => {
  }

  const handleDeletePartShape = (_id: string): void => {
  }

  const handleDeleteAnnotationShape = (_id: string): void => {
  }

  return {
    handleDeleteBlockShape,
    handleDeletePartShape,
    handleDeleteAnnotationShape
  }
}
