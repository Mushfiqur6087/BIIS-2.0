<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let teacher = null, loading = true, error = '';
  let editing = false, saving = false, saveError = '', saveSuccess = false;
  let editForm = {};
  const id = $page.params.id;

  onMount(async () => {
    try { ({ teacher } = await admin.teacher(id)); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });

  function openEdit() {
    editForm = {
      PHONE1:  teacher.PHONE1  || '',
      PHONE2:  teacher.PHONE2  || '',
      MAIL:    teacher.MAIL    || '',
      ADDRESS: teacher.ADDRESS || '',
      RANK:    teacher.RANK    || '',
    };
    saveError = ''; saveSuccess = false;
    editing = true;
  }

  async function saveEdit() {
    saving = true; saveError = '';
    try {
      await admin.updateTeacher(id, editForm);
      const d = await admin.teacher(id);
      teacher = d.teacher;
      saveSuccess = true;
      setTimeout(() => { editing = false; saveSuccess = false; }, 1200);
    } catch (e) { saveError = e.message; }
    finally { saving = false; }
  }

  const ranks = ['Professor','Associate Professor','Assistant Professor','Lecturer'];
  const viewFields = [
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
      {#if teacher}
        <button class="btn btn-primary btn-sm ml-auto" on:click={openEdit}>✏️ Edit</button>
      {/if}
    </div>

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span></div>
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
          {#each viewFields as [label, key]}
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

  <!-- Edit Modal -->
  {#if editing}
    <div class="modal-backdrop" on:click|self={() => editing = false}>
      <div class="modal-box">
        <h2 class="modal-title">Edit Teacher — {id}</h2>
        {#if saveSuccess}<div class="alert alert-success mb-3">✓ Saved!</div>{/if}
        {#if saveError}<div class="alert alert-error mb-3">{saveError}</div>{/if}

        <div class="grid-2">
          <div class="form-group"><label>Phone 1</label><input type="tel" bind:value={editForm.PHONE1} /></div>
          <div class="form-group"><label>Phone 2</label><input type="tel" bind:value={editForm.PHONE2} /></div>
          <div class="form-group"><label>Email</label><input type="email" bind:value={editForm.MAIL} /></div>
          <div class="form-group">
            <label>Rank</label>
            <select bind:value={editForm.RANK}>
              {#each ranks as r}<option value={r}>{r}</option>{/each}
            </select>
          </div>
        </div>
        <div class="form-group"><label>Address</label><textarea bind:value={editForm.ADDRESS} rows="2"></textarea></div>

        <div class="flex gap-3 mt-2">
          <button class="btn btn-primary flex-1" disabled={saving} on:click={saveEdit}>
            {#if saving}<span class="spinner"></span>{:else}Save Changes{/if}
          </button>
          <button class="btn btn-ghost flex-1" on:click={() => editing = false}>Cancel</button>
        </div>
      </div>
    </div>
  {/if}
</DashboardLayout>

<style>
  .profile-header { display: flex; align-items: center; gap: 1.5rem; }
  .avatar-xl { width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0; background: var(--accent-dim); border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 700; color: var(--accent); }
  .field-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
  .field-item { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.85rem; }
  .field-label { display: block; font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem; }
  .field-value { font-size: 0.9rem; font-weight: 500; }
  .ml-auto { margin-left: auto; }
  .flex-1 { flex: 1; }
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .modal-box { background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
  .modal-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--accent); }
</style>
