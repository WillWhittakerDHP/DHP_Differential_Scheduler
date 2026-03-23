/**
 */
import type { Ref } from 'vue'

interface NotificationItem {
  id: number
  [key: string]: unknown
}

export function useNotificationActions(notifications: Ref<NotificationItem[]>): {
  removeNotification: (notificationId: number) => void
  markRead: (notificationIds: number[]) => void
  markUnRead: (notificationIds: number[]) => void
} {
  function removeNotification(notificationId: number): void {
    notifications.value = notifications.value.filter((item) => item.id !== notificationId)
  }

  function markRead(notificationIds: number[]): void {
    const idsSet = new Set(notificationIds)
    notifications.value = notifications.value.map((item) =>
      idsSet.has(item.id) ? { ...item, isSeen: true } : item
    )
  }

  function markUnRead(notificationIds: number[]): void {
    const idsSet = new Set(notificationIds)
    notifications.value = notifications.value.map((item) =>
      idsSet.has(item.id) ? { ...item, isSeen: false } : item
    )
  }

  return { removeNotification, markRead, markUnRead }
}
