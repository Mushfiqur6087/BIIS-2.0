<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let teacher = null, loading = true, error = '';
  const id = $page.params.id;

  onMount(async () => {
    try { ({ teacher } = await admin.teacher(id)); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });

  const fields = [
    ['Teacher ID','TEACHER_ID'],['First Name','FIRSTNAME'],['Last Name','LASTNAME'],
    ['Department','DEPT_ID'],['Rank','RANK'],['Email','MAIL'],
    ['Phone','PHONE1'],['Phone 2','PHONE2'],['Address','ADDRESS'],['Salary','SALARY'],
  ];
</script>

<svelte:head><title>BIIS 2.0 — Teacher Detail</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header flex items-center gap-3">
      <a href="/admin/teachers" class="btn btn-ghost btn-sm">← Back</a>
      <div><h1>Teacher Profile</h1><p>ID: {id}</p></div>
    </div>

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else if error}
      <div class="alert alert-error">{error}</div>
    {:else if teacher}
      <div class="card">
        <div class="profile-header">
          <div class="avatar-xl">{teacher.FIRSTNAME?.[0]}{teacher.LASTNAME?.[0]}</div>
          <div>
            <h2>{teacher.FIRSTNAME} {teacher.LASTNAME}</h2>
            <p class="text-muted">Teacher ID: <span class="text-accent font-semibold">{teacher.TEACHER_ID}</span></p>
            <span class="badge badge-accent mt-2">{teacher.RANK ?? 'Lecturer'}</span>
          </div>
        </div>
        <div class="field-grid mt-6">
          {#each fields as [label, key]}
            {#if teacher[key] !== undefined && teacher[key] !== null}
              <div class="field-item">
                <span class="field-label">{label}</span>
                <span class="field-value">{key === 'SALARY' ? '৳' + teacher[key] : teacher[key]}</span>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {:else}
      <div class="alert alert-error">Teacher not found.</div>
    {/if}
  </div>
</DashboardLayout>

<style>
  .profile-header { display: flex; align-items: center; gap: 1.5rem; }
  .avatar-xl {
    width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
    background: var(--accent-dim); border: 2px solid var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.75rem; font-weight: 700; color: var(--accent);
  }
  .field-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
  .field-item { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.85rem; }
  .field-label { display: block; font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem; }
  .field-value { font-size: 0.9rem; font-weight: 500; }
</style>
