<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { user, checkAuth } from '$lib/stores/auth.js';

  onMount(async () => {
    const me = await checkAuth();
    const path = $page.url.pathname;

    // If not logged in and not on login page → send to login
    if (!me && path !== '/') {
      goto('/');
      return;
    }

    // If logged in and on login page → send to dashboard
    if (me && path === '/') {
      if (me.role === 'admin')   goto('/admin');
      else if (me.role === 'student') goto('/student');
      else goto('/teacher');
    }
  });
</script>

<slot />
