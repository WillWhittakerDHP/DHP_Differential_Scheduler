<script lang="ts" setup>
import { ref } from 'vue'
import type { Notification } from '@layouts/types'
import { useNotificationActions } from '@/composables/layout/useNotificationActions'

import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import paypal from '@images/cards/paypal-rounded.png'

const notifications = ref<Notification[]>([
  {
    id: 1,
    img: avatar4,
    title: 'Congratulation Flora! 🎉',
    subtitle: 'Won the monthly top-performer badge',
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

const { removeNotification, markRead, markUnRead } = useNotificationActions(notifications)

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
