<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let teacherList = [], departmentList = [], loading = true, search = '', selectedDept = '', error = '';
  let confirmDelete = null, deleting = false;

  onMount(async () => {
    try { ({ teacherList, departmentList } = await admin.teachers()); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });

  $: filtered = teacherList.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || String(t.TEACHER_ID).includes(q) ||
      (t.FIRSTNAME + ' ' + t.LASTNAME).toLowerCase().includes(q);
    const matchDept = !selectedDept || t.DEPT_ID === selectedDept;
    return matchSearch && matchDept;
  });

  async function doDelete(id) {
    deleting = true;
    try {
      await admin.deleteTeacher(id);
      teacherList = teacherList.filter(t => t.TEACHER_ID !== id);
      confirmDelete = null;
    } catch (e) { error = e.message; }
    finally { deleting = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Teacher List</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header flex justify-between items-center">
      <div>
        <h1>Teachers</h1>
        <p>Manage all faculty members across departments</p>
      </div>
      <a href="/admin/add-teacher" class="btn btn-primary">+ Add Teacher</a>
    </div>

    {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}

    <div class="filters card mb-4">
      <input class="input" placeholder="Search by name or ID…" bind:value={search} />
      <select bind:value={selectedDept}>
        <option value="">All Departments</option>
        {#each departmentList as d}
          <option value={d.DEPT_ID}>{d.DEPT_NAME}</option>
        {/each}
      </select>
      <span class="text-muted text-sm">{filtered.length} teachers</span>
    </div>

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else}
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Dept</th><th>Rank</th><th>Email</th><th>Salary</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {#each filtered as t}
                <tr>
                  <td><span class="badge badge-accent">{t.TEACHER_ID}</span></td>
                  <td class="font-medium">{t.FIRSTNAME} {t.LASTNAME}</td>
                  <td>{t.DEPT_ID}</td>
                  <td>{t.RANK ?? '—'}</td>
                  <td class="text-muted">{t.MAIL ?? '—'}</td>
                  <td>{t.SALARY ? '৳' + t.SALARY : '—'}</td>
                  <td>
                    <div class="flex gap-2">
                      <a href="/admin/teachers/{t.TEACHER_ID}" class="btn btn-ghost btn-sm">View</a>
                      <button class="btn btn-danger btn-sm" on:click={() => confirmDelete = t}>Delete</button>
                    </div>
                  </td>
                </tr>
              {:else}
                <tr><td colspan="7" class="text-center text-muted">No teachers found</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>

  {#if confirmDelete}
    <div class="modal-backdrop" on:click={() => confirmDelete = null} role="presentation">
      <div class="modal" on:click|stopPropagation role="dialog">
        <h3>Delete Teacher?</h3>
        <p class="text-muted text-sm mt-2">This will permanently remove <strong>{confirmDelete.FIRSTNAME} {confirmDelete.LASTNAME}</strong> (ID: {confirmDelete.TEACHER_ID}). Cannot be undone.</p>
        <div class="flex gap-3 mt-6">
          <button class="btn btn-ghost flex-1" on:click={() => confirmDelete = null}>Cancel</button>
          <button class="btn btn-danger flex-1" disabled={deleting} on:click={() => doDelete(confirmDelete.TEACHER_ID)}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</DashboardLayout>

<style>
  .filters { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
  .filters .input { flex: 1; min-width: 200px; }
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal { background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem; width: min(420px, calc(100vw - 2rem)); box-shadow: 0 8px 64px rgba(0,0,0,0.5); }
  .modal h3 { font-size: 1.1rem; font-weight: 700; }
  .flex-1 { flex: 1; }
</style>
