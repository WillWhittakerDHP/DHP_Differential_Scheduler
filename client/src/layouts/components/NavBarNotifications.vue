<script lang="ts" setup>
import type { Notification } from '@layouts/types'

import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import paypal from '@images/cards/paypal-rounded.png'

const notifications = ref<Notification[]>([
  {
    id: 1,
    img: avatar4,
    title: 'Congratulation Flora! 🎉',
    subtitle: 'Won the monthly best seller badge',
    time: 'Today',
    isSeen: true,
  },
  {
    id: 2,
    text: 'Tom Holland',
    title: 'New user registered.',
    subtitle: '5 hours ago',
    time: 'Yesterday',
    isSeen: false,
  },
  {
    id: 3,
    img: avatar5,
    title: 'New message received 👋🏻',
    subtitle: 'You have 10 unread messages',
    time: '11 Aug',
    isSeen: true,
  },
  {
    id: 4,
    img: paypal,
    title: 'PayPal',
    subtitle: 'Received Payment',
    time: '25 May',
    isSeen: false,
    color: 'error',
  },
  {
    id: 5,
    img: avatar3,
    title: 'Received Order 📦',
    subtitle: 'New order received from john',
    time: '19 Mar',
    isSeen: true,
  },
])

const removeNotification = (notificationId: number) => {
  // WHY: Functional approach avoids forEach with splice mutations
  // PATTERN: Filter out the notification with matching ID
  notifications.value = notifications.value.filter(item => item.id !== notificationId)
}

const markRead = (notificationId: number[]) => {
  // WHY: Functional approach avoids forEach with property mutations
  // PATTERN: Map notifications and update isSeen for matching IDs
  const idsSet = new Set(notificationId)
  notifications.value = notifications.value.map(item => 
    idsSet.has(item.id) ? { ...item, isSeen: true } : item
  )
}

const markUnRead = (notificationId: number[]) => {
  // WHY: Functional approach avoids forEach with property mutations
  // PATTERN: Map notifications and update isSeen for matching IDs
  const idsSet = new Set(notificationId)
  notifications.value = notifications.value.map(item => 
    idsSet.has(item.id) ? { ...item, isSeen: false } : item
  )
}

const handleNotificationClick = (notification: Notification) => {
  if (!notification.isSeen)
    markRead([notification.id])
}
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @read="markRead"
    @unread="markUnRead"
    @click:notification="handleNotificationClick"
  />
</template>
