<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { teacher as teacherApi } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let data = null;
  let loading = true;

  onMount(async () => {
    try { data = await teacherApi.dashboard(); }
    catch(e) { console.error(e); }
    finally { loading = false; }
  });
</script>

<svelte:head><title>BIIS 2.0 — Teacher Dashboard</title></svelte:head>

<DashboardLayout role="teacher" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Teacher Dashboard</h1>
      <p>Welcome back! Manage your courses, grades, and more.</p>
    </div>

    {#if loading}
      <div class="flex items-center gap-3 mt-6"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else if data}
      {@const ti = data.teacherInfo}
      <div class="profile-grid">
        <div class="card profile-card">
          <div class="avatar-lg">{ti.firstName?.[0]}{ti.lastName?.[0]}</div>
          <h2 class="mt-4">{ti.firstName} {ti.lastName}</h2>
          <p class="text-muted text-sm">Teacher ID: <strong class="text-accent">{ti.teacherID}</strong></p>
          <div class="rank-badge mt-2">{ti.rank || 'Lecturer'}</div>
          <p class="text-muted text-sm mt-1">Dept: {ti.deptID}</p>
        </div>

        <div class="info-grid">
          {#each [
            ['📧','Email',   ti.email   || '—'],
            ['📞','Phone',   ti.phoneNo || '—'],
            ['📍','Address', ti.address || '—'],
            ['💰','Salary',  ti.salary  ? `৳${ti.salary}` : '—'],
          ] as [icon, label, value]}
            <div class="info-item">
              <span class="info-icon">{icon}</span>
              <div>
                <div class="text-xs text-muted font-semibold">{label}</div>
                <div class="text-sm">{value}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="quick-actions mt-6">
        <h2 class="section-title">Quick Actions</h2>
        <div class="grid-3">
          {#each [
            ['/teacher/courses',      '📚', 'Approve Courses'],
            ['/teacher/grades',       '📝', 'Assign Grades'],
            ['/teacher/scholarship',  '🏆', 'Scholarships'],
            ['/teacher/profile',      '👤', 'Update Profile'],
            ['/teacher/notifications','🔔', 'Notifications'],
          ] as [href, icon, label]}
            <a {href} class="quick-card">
              <span class="quick-icon">{icon}</span>
              <span>{label}</span>
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</DashboardLayout>

<style>
  .profile-grid { display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; }
  @media(max-width:768px) { .profile-grid { grid-template-columns: 1fr; } }
  .profile-card { text-align: center; display: flex; flex-direction: column; align-items: center; }
  .avatar-lg {
    width: 72px; height: 72px; border-radius: 50%;
    background: var(--accent-dim); border: 2px solid var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; font-weight: 700; color: var(--accent);
  }
  .rank-badge { background: var(--accent-dim); color: var(--accent); padding: 0.3rem 0.8rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .info-item { background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.85rem; display: flex; align-items: flex-start; gap: 0.75rem; }
  .info-icon { font-size: 1.1rem; }
  .section-title { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1rem; }
  .quick-card {
    background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-md);
    padding: 1.25rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    text-decoration: none; color: var(--text-primary); font-size: 0.875rem; font-weight: 500;
    transition: all var(--transition); text-align: center;
  }
  .quick-card:hover { border-color: var(--accent); background: var(--accent-dim); transform: translateY(-2px); }
  .quick-icon { font-size: 1.5rem; }
</style>
