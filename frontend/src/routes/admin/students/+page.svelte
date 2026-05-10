<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let studentList = [], departmentList = [], loading = true, search = '', selectedDept = '', error = '';
  let confirmDelete = null;
  let deleting = false;

  onMount(async () => {
    try { ({ studentList, departmentList } = await admin.students()); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });

  $: filtered = studentList.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || String(s.STUDENT_ID).includes(q) ||
      (s.FIRST_NAME + ' ' + s.LAST_NAME).toLowerCase().includes(q) ||
      String(s.DEPT_ID || '').toLowerCase().includes(q);
    const matchDept = !selectedDept || s.DEPT_ID === selectedDept;
    return matchSearch && matchDept;
  });

  async function doDelete(id) {
    deleting = true;
    try {
      await admin.deleteStudent(id);
      studentList = studentList.filter(s => s.STUDENT_ID !== id);
      confirmDelete = null;
    } catch (e) {
      error = e.message;
    } finally { deleting = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Student List</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header flex justify-between items-center">
      <div>
        <h1>Students</h1>
        <p>Manage all enrolled students across departments</p>
      </div>
      <a href="/admin/add-student" class="btn btn-primary">+ Add Student</a>
    </div>

    {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}

    <!-- Filters -->
    <div class="filters card mb-4">
      <input class="input" placeholder="Search by name or ID…" bind:value={search} />
      <select bind:value={selectedDept}>
        <option value="">All Departments</option>
        {#each departmentList as d}
          <option value={d.DEPT_ID}>{d.DEPT_NAME} ({d.DEPT_ID})</option>
        {/each}
      </select>
      <span class="text-muted text-sm">{filtered.length} students</span>
    </div>

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else}
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Dept</th><th>Level / Term</th><th>Hall</th><th>Email</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each filtered as s}
                <tr>
                  <td><span class="badge badge-accent">{s.STUDENT_ID}</span></td>
                  <td class="font-medium">{s.FIRST_NAME} {s.LAST_NAME}</td>
                  <td>{s.DEPT_ID}</td>
                  <td>{s.LEVEL ?? '—'} / {s.TERM ?? '—'}</td>
                  <td>{s.HALL ?? '—'}</td>
                  <td class="text-muted">{s.EMAIL ?? '—'}</td>
                  <td>
                    <div class="flex gap-2">
                      <a href="/admin/students/{s.STUDENT_ID}" class="btn btn-ghost btn-sm">View</a>
                      <button class="btn btn-danger btn-sm" on:click={() => confirmDelete = s}>Delete</button>
                    </div>
                  </td>
                </tr>
              {:else}
                <tr><td colspan="7" class="text-center text-muted">No students found</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>

  <!-- Delete confirm modal -->
  {#if confirmDelete}
    <div class="modal-backdrop" on:click={() => confirmDelete = null} role="presentation">
      <div class="modal" on:click|stopPropagation role="dialog">
        <h3>Delete Student?</h3>
        <p class="text-muted text-sm mt-2">This will permanently remove <strong>{confirmDelete.FIRST_NAME} {confirmDelete.LAST_NAME}</strong> (ID: {confirmDelete.STUDENT_ID}) from the system. This cannot be undone.</p>
        <div class="flex gap-3 mt-6">
          <button class="btn btn-ghost flex-1" on:click={() => confirmDelete = null}>Cancel</button>
          <button class="btn btn-danger flex-1" disabled={deleting} on:click={() => doDelete(confirmDelete.STUDENT_ID)}>
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
  select { flex: 0 0 auto; }

  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal { background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem; width: min(420px, calc(100vw - 2rem)); box-shadow: 0 8px 64px rgba(0,0,0,0.5); }
  .modal h3 { font-size: 1.1rem; font-weight: 700; }
  .flex-1 { flex: 1; }
</style>
