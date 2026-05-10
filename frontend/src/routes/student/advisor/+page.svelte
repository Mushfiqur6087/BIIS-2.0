<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { student } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let advisor = null, loading = true, error = '';

  onMount(async () => {
    try { ({ advisor } = await student.advisor()); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });
</script>

<svelte:head><title>BIIS 2.0 — My Advisor</title></svelte:head>

<DashboardLayout role="student" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>My Academic Advisor</h1>
      <p>Contact your assigned advisor for academic guidance</p>
    </div>

    {#if error}<div class="alert alert-error">{error}</div>{/if}
    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else if !advisor}
      <div class="empty-state"><p>No advisor assigned yet. Contact your department.</p></div>
    {:else}
      <div class="advisor-card card">
        <div class="advisor-header">
          {#if advisor.image && !advisor.image.includes('DEFAULT')}
            <img src="/img/{advisor.image}" alt="Advisor" class="advisor-photo" />
          {:else}
            <div class="advisor-avatar">{advisor.FIRSTNAME?.[0]}{advisor.LASTNAME?.[0]}</div>
          {/if}
          <div>
            <h2>{advisor.FIRSTNAME} {advisor.LASTNAME}</h2>
            <p class="text-muted text-sm">Teacher ID: <span class="text-accent font-semibold">{advisor.TEACHER_ID}</span></p>
            {#if advisor.RANK}
              <span class="badge badge-accent mt-2">{advisor.RANK}</span>
            {/if}
          </div>
        </div>

        <div class="contact-grid mt-6">
          {#if advisor.MAIL}
            <a href="mailto:{advisor.MAIL}" class="contact-card">
              <span class="contact-icon">📧</span>
              <div>
                <div class="text-xs text-muted">Email</div>
                <div class="text-sm font-medium">{advisor.MAIL}</div>
              </div>
            </a>
          {/if}
          {#if advisor.PHONE1}
            <div class="contact-card">
              <span class="contact-icon">📞</span>
              <div>
                <div class="text-xs text-muted">Phone</div>
                <div class="text-sm font-medium">{advisor.PHONE1}</div>
              </div>
            </div>
          {/if}
          {#if advisor.ADDRESS}
            <div class="contact-card">
              <span class="contact-icon">📍</span>
              <div>
                <div class="text-xs text-muted">Address</div>
                <div class="text-sm font-medium">{advisor.ADDRESS}</div>
              </div>
            </div>
          {/if}
          {#if advisor.DEPT_ID}
            <div class="contact-card">
              <span class="contact-icon">🏛</span>
              <div>
                <div class="text-xs text-muted">Department</div>
                <div class="text-sm font-medium">{advisor.DEPT_ID}</div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</DashboardLayout>

<style>
  .advisor-card { max-width: 640px; }
  .advisor-header { display: flex; align-items: center; gap: 1.5rem; }
  .advisor-photo { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent); }
  .advisor-avatar {
    width: 90px; height: 90px; border-radius: 50%; flex-shrink: 0;
    background: var(--accent-dim); border: 2px solid var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; font-weight: 700; color: var(--accent);
  }
  .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .contact-card { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.85rem; display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: inherit; transition: background var(--transition); }
  .contact-card:hover { background: var(--glass-hover); }
  .contact-icon { font-size: 1.25rem; }
  .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
</style>
