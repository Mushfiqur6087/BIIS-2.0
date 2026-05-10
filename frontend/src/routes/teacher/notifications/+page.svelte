<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';
  import { io } from 'socket.io-client';

  let notifications = [], socket;

  onMount(() => {
    socket = io({ transports: ['websocket'] });
    socket.on('message', (msgs) => {
      notifications = [...msgs.map(m => ({ ...m, _new: true })), ...notifications].slice(0, 50);
    });
    return () => socket?.disconnect();
  });
</script>

<svelte:head><title>BIIS 2.0 — Notifications</title></svelte:head>

<DashboardLayout role="teacher" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Notifications</h1>
      <p>Real-time updates from students and admin</p>
    </div>
    <div class="notif-list">
      {#if notifications.length === 0}
        <div class="empty-state">
          <span class="empty-icon">🔔</span>
          <p>No new notifications</p>
          <p class="text-muted text-sm">You'll be notified when students apply for scholarships</p>
        </div>
      {/if}
      {#each notifications as n}
        <div class="notif-item" class:new={n._new}>
          <div class="notif-dot"></div>
          <div>
            <p class="notif-text">{n.NOTIFICATION_DETAILS || JSON.stringify(n)}</p>
            <span class="notif-time">{n.DATE || n.CURRENT_DATE || 'just now'}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</DashboardLayout>

<style>
  .notif-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .notif-item { display: flex; align-items: flex-start; gap: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 1rem 1.25rem; transition: all var(--transition); }
  .notif-item.new { border-color: var(--accent); background: var(--accent-dim); animation: fadeInUp 0.3s ease both; }
  .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex-shrink: 0; margin-top: 6px; }
  .notif-text { font-size: 0.875rem; }
  .notif-time { font-size: 0.72rem; color: var(--text-muted); }
  .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }
  .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
</style>
