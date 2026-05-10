<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let student = null, loading = true, error = '';
  let editing = false, saving = false, saveError = '', saveSuccess = false;
  let editForm = {};
  const id = $page.params.id;

  onMount(async () => {
    try { ({ student } = await admin.student(id)); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });

  function openEdit() {
    editForm = {
      PHONE_NO:  student.PHONE_NO  || '',
      PHONE_NO2: student.PHONE_NO2 || '',
      EMAIL:     student.EMAIL     || '',
      ADDRESS:   student.ADDRESS   || '',
      HALL:      student.HALL      || '',
      NID:       student.NID       || '',
    };
    saveError = ''; saveSuccess = false;
    editing = true;
  }

  async function saveEdit() {
    saving = true; saveError = '';
    try {
      await admin.updateStudent(id, editForm);
      // Refresh data
      const d = await admin.student(id);
      student = d.student;
      saveSuccess = true;
      setTimeout(() => { editing = false; saveSuccess = false; }, 1200);
    } catch (e) { saveError = e.message; }
    finally { saving = false; }
  }

  const viewFields = [
    ['Student ID','STUDENT_ID'],['First Name','FIRST_NAME'],['Last Name','LAST_NAME'],
    ['Department','DEPT_ID'],['Level','LEVEL'],['Term','TERM'],
    ['Hall','HALL'],['Email','EMAIL'],['Phone','PHONE_NO'],['Phone 2','PHONE_NO2'],
    ['Address','ADDRESS'],['Date of Birth','DATE_OF_BIRTH'],['NID','NID'],
    ['Bank Account','BANK_ACCOUNT'],
  ];

  const halls = ['Ahsan Ullah Hall','Titumir Hall','Sher-e-Bangla Hall','Quaid-e-Azam Hall','Dr. M.A. Rashid Hall','Nazrul Islam Hall'];
</script>

<svelte:head><title>BIIS 2.0 — Student Detail</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header flex items-center gap-3">
      <a href="/admin/students" class="btn btn-ghost btn-sm">← Back</a>
      <div><h1>Student Profile</h1><p>ID: {id}</p></div>
      {#if student}
        <button class="btn btn-primary btn-sm ml-auto" on:click={openEdit}>✏️ Edit</button>
      {/if}
    </div>

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else if error}
      <div class="alert alert-error">{error}</div>
    {:else if student}
      <div class="card">
        <div class="profile-header">
          {#if student.IMAGE && !String(student.IMAGE).includes('DEFAULT')}
            <img src="/img/{student.IMAGE}" alt="Student" class="profile-photo" />
          {:else}
            <div class="avatar-xl">{student.FIRST_NAME?.[0]}{student.LAST_NAME?.[0]}</div>
          {/if}
          <div>
            <h2>{student.FIRST_NAME} {student.LAST_NAME}</h2>
            <p class="text-muted">ID: <span class="text-accent font-semibold">{student.STUDENT_ID}</span></p>
            <span class="badge badge-accent mt-2">{student.DEPT_ID} · L{student.LEVEL?.replace('L','')} T{student.TERM?.replace('T','')}</span>
          </div>
        </div>
        <div class="field-grid mt-6">
          {#each viewFields as [label, key]}
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

  <!-- Edit Modal -->
  {#if editing}
    <div class="modal-backdrop" on:click|self={() => editing = false}>
      <div class="modal-box">
        <h2 class="modal-title">Edit Student — {id}</h2>

        {#if saveSuccess}<div class="alert alert-success mb-3">✓ Saved!</div>{/if}
        {#if saveError}<div class="alert alert-error mb-3">{saveError}</div>{/if}

        <div class="grid-2">
          <div class="form-group"><label>Phone 1</label><input type="tel" bind:value={editForm.PHONE_NO} /></div>
          <div class="form-group"><label>Phone 2</label><input type="tel" bind:value={editForm.PHONE_NO2} /></div>
          <div class="form-group"><label>Email</label><input type="email" bind:value={editForm.EMAIL} /></div>
          <div class="form-group"><label>NID</label><input bind:value={editForm.NID} /></div>
          <div class="form-group">
            <label>Hall</label>
            <select bind:value={editForm.HALL}>
              <option value="">Select…</option>
              {#each halls as h}<option value={h}>{h}</option>{/each}
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
  .profile-photo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent); }
  .avatar-xl { width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0; background: var(--accent-dim); border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 700; color: var(--accent); }
  .field-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
  .field-item { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.85rem; }
  .field-label { display: block; font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem; }
  .field-value { font-size: 0.9rem; font-weight: 500; }
  .ml-auto { margin-left: auto; }
  .flex-1 { flex: 1; }

  /* Modal */
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .modal-box { background: var(--bg-surface); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); padding: 2rem; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
  .modal-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--accent); }
</style>
