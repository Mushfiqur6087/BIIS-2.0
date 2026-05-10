<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let student = null, loading = true, error = '';
  const id = $page.params.id;

  onMount(async () => {
    try { ({ student } = await admin.student(id)); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });

  const fields = [
    ['Student ID', 'STUDENT_ID'], ['First Name', 'FIRST_NAME'], ['Last Name', 'LAST_NAME'],
    ['Department', 'DEPT_ID'], ['Hall', 'HALL'], ['Level', 'LEVEL'], ['Term', 'TERM'],
    ['Email', 'EMAIL'], ['Phone', 'PHONE_NO'], ['Phone 2', 'PHONE_NO2'],
    ['Bank Account', 'BANK_ACCOUNT'], ['Address', 'ADDRESS'],
    ['Date of Birth', 'DATE_OF_BIRTH'], ['NID', 'NID'], ['Advisor ID', 'ADVISOR_ID'],
  ];
</script>

<svelte:head><title>BIIS 2.0 — Student Detail</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header flex items-center gap-3">
      <a href="/admin/students" class="btn btn-ghost btn-sm">← Back</a>
      <div>
        <h1>Student Profile</h1>
        <p>ID: {id}</p>
      </div>
    </div>

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else if error}
      <div class="alert alert-error">{error}</div>
    {:else if student}
      <div class="card">
        <div class="profile-header">
          <div class="avatar-xl">{student.FIRST_NAME?.[0]}{student.LAST_NAME?.[0]}</div>
          <div>
            <h2>{student.FIRST_NAME} {student.LAST_NAME}</h2>
            <p class="text-muted">Student ID: <span class="text-accent font-semibold">{student.STUDENT_ID}</span></p>
          </div>
        </div>
        <div class="field-grid mt-6">
          {#each fields as [label, key]}
            {#if student[key] !== undefined && student[key] !== null}
              <div class="field-item">
                <span class="field-label">{label}</span>
                <span class="field-value">{student[key]}</span>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {:else}
      <div class="alert alert-error">Student not found.</div>
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
  .field-value { font-size: 0.9rem; font-weight: 500; word-break: break-all; }
</style>
