<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { student as studentApi } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let data = null;
  let loading = true;

  onMount(async () => {
    try { data = await studentApi.dashboard(); }
    catch (e) { console.error(e); }
    finally { loading = false; }
  });
</script>

<svelte:head><title>BIIS 2.0 — Student Dashboard</title></svelte:head>

<DashboardLayout role="student" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Student Dashboard</h1>
      <p>Welcome back! Here's your profile overview.</p>
    </div>

    {#if loading}
      <div class="flex items-center gap-3 mt-6"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else if data}
      {@const si = data.studentInfo}
      {@const st = data.stInfo?.[0]}
      <!-- Profile card -->
      <div class="profile-grid">
        <div class="card profile-card">
          <div class="avatar-lg">{si.firstName?.[0]}{si.lastName?.[0]}</div>
          <h2 class="mt-4">{si.firstName} {si.lastName}</h2>
          <p class="text-muted text-sm">Student ID: <strong class="text-accent">{si.studentID}</strong></p>
          <div class="dept-badge mt-2">Dept: {si.deptID} · Hall: {si.hall}</div>
          <div class="level-badge mt-1">{st?.LEVEL || '–'} / {st?.TERM || '–'}</div>
        </div>

        <div class="info-grid">
          {#each [
            ['📧','Email', si.email || '—'],
            ['📞','Phone', si.phoneNo || '—'],
            ['🏦','Bank Account', si.bankNo || '—'],
            ['📍','Address', si.address || '—'],
            ['🎂','Date of Birth', si.dateOfBirth || '—'],
            ['🪪','NID', si.nid || '—'],
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

      <!-- Quick actions -->
      <div class="quick-actions mt-6">
        <h2 class="section-title">Quick Actions</h2>
        <div class="grid-3">
          {#each [
            ['/student/courses',    '📚', 'View Courses'],
            ['/student/results',    '📊', 'My Results'],
            ['/student/dues',       '💳', 'Check Dues'],
            ['/student/advisor',    '👨‍🏫', 'My Advisor'],
            ['/student/scholarship','🏆', 'Scholarship'],
            ['/student/profile',    '👤', 'Update Profile'],
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
  .dept-badge { background: var(--accent-dim); color: var(--accent); padding: 0.3rem 0.8rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
  .level-badge { color: var(--text-muted); font-size: 0.75rem; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .info-item { background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.85rem; display: flex; align-items: flex-start; gap: 0.75rem; }
  .info-icon { font-size: 1.1rem; margin-top: 2px; }

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
