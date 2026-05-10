<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let dueTypes = [], loading = true, error = '';
  let addForm = { Description: '', Amount: '' };
  let saving = false, addSuccess = false, addError = '';

  // CSV assign state
  let assignDueID = '', assignFile = null, assigning = false, assignOk = false, assignErr = '';
  // CSV clear state
  let clearDueID  = '', clearFile  = null, clearing  = false, clearOk  = false, clearErr  = '';

  onMount(load);

  async function load() {
    loading = true; error = '';
    try { dueTypes = (await admin.dueTypes()).dues || []; }
    catch (e) { error = e.message; }
    finally { loading = false; }
  }

  async function addDue(e) {
    e.preventDefault();
    saving = true; addError = ''; addSuccess = false;
    try {
      await admin.addDueType(addForm);
      addSuccess = true;
      addForm = { Description: '', Amount: '' };
      await load();
    } catch (err) { addError = err.data?.error || err.message; }
    finally { saving = false; }
  }

  async function assignDues(e) {
    e.preventDefault();
    if (!assignFile || !assignDueID) return;
    assigning = true; assignErr = ''; assignOk = false;
    try {
      const fd = new FormData();
      fd.append('File', assignFile);
      fd.append('option', assignDueID);
      await admin.assignDuesCSV(fd);
      assignOk = true; assignFile = null; assignDueID = '';
    } catch (err) { assignErr = err.data?.error || err.message; }
    finally { assigning = false; }
  }

  async function clearDues(e) {
    e.preventDefault();
    if (!clearFile || !clearDueID) return;
    clearing = true; clearErr = ''; clearOk = false;
    try {
      const fd = new FormData();
      fd.append('File', clearFile);
      fd.append('option', clearDueID);
      await admin.clearDuesCSV(fd);
      clearOk = true; clearFile = null; clearDueID = '';
    } catch (err) { clearErr = err.data?.error || err.message; }
    finally { clearing = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Dues Management</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Dues Management</h1>
      <p>Create due categories and assign or clear student dues via CSV</p>
    </div>

    {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}

    <div class="grid-2 mb-6">
      <!-- ① Add new due type -->
      <div class="card">
        <h2 class="section-title mb-4">💳 Add Due Category</h2>
        {#if addSuccess}<div class="alert alert-success mb-3">✓ Due type added!</div>{/if}
        {#if addError}<div class="alert alert-error mb-3">{addError}</div>{/if}
        <form on:submit={addDue}>
          <div class="form-group"><label for="desc">Description</label><input id="desc" bind:value={addForm.Description} placeholder="e.g. Hall Fee" required /></div>
          <div class="form-group"><label for="amt">Amount (৳)</label><input id="amt" type="number" bind:value={addForm.Amount} placeholder="e.g. 1200" min="1" required /></div>
          <button type="submit" class="btn btn-primary w-full" disabled={saving}>
            {#if saving}<span class="spinner"></span>{:else}Add Due Type{/if}
          </button>
        </form>
      </div>

      <!-- Due types list -->
      <div class="card">
        <h2 class="section-title mb-4">Existing Categories</h2>
        {#if loading}
          <div class="flex items-center gap-3"><span class="spinner"></span></div>
        {:else if !dueTypes.length}
          <p class="text-muted text-sm">No due types yet.</p>
        {:else}
          <div class="due-list">
            {#each dueTypes as d}
              <div class="due-row">
                <div>
                  <div class="font-medium text-sm">{d.DESCRIPTION}</div>
                  <div class="text-xs text-muted">ID: {d.DUE_ID}</div>
                </div>
                <span class="due-amount">৳{Number(d.AMOUNT).toLocaleString()}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- ② Assign dues via CSV -->
    <div class="grid-2">
      <div class="card">
        <h2 class="section-title mb-2">📤 Assign Dues via CSV</h2>
        <p class="text-sm text-muted mb-4">CSV must have a <code>STUDENT_ID</code> column. Each listed student will be assigned the selected due.</p>
        {#if assignOk}<div class="alert alert-success mb-3">✓ Dues assigned!</div>{/if}
        {#if assignErr}<div class="alert alert-error mb-3">{assignErr}</div>{/if}
        <form on:submit={assignDues}>
          <div class="form-group">
            <label>Select Due Type</label>
            <select bind:value={assignDueID} required>
              <option value="">Choose…</option>
              {#each dueTypes as d}<option value={d.DUE_ID}>{d.DESCRIPTION} (৳{d.AMOUNT})</option>{/each}
            </select>
          </div>
          <div class="form-group">
            <label>Upload CSV</label>
            <input type="file" accept=".csv" on:change={e => assignFile = e.target.files[0]} required />
          </div>
          <button type="submit" class="btn btn-primary w-full" disabled={assigning || !assignFile || !assignDueID}>
            {#if assigning}<span class="spinner"></span> Assigning…{:else}📤 Assign Dues{/if}
          </button>
        </form>
      </div>

      <!-- ③ Clear dues via CSV -->
      <div class="card">
        <h2 class="section-title mb-2">✅ Mark Dues as Paid via CSV</h2>
        <p class="text-sm text-muted mb-4">CSV must have a <code>STUDENT_ID</code> column. Each listed student's due will be marked as paid.</p>
        {#if clearOk}<div class="alert alert-success mb-3">✓ Dues cleared!</div>{/if}
        {#if clearErr}<div class="alert alert-error mb-3">{clearErr}</div>{/if}
        <form on:submit={clearDues}>
          <div class="form-group">
            <label>Select Due Type</label>
            <select bind:value={clearDueID} required>
              <option value="">Choose…</option>
              {#each dueTypes as d}<option value={d.DUE_ID}>{d.DESCRIPTION} (৳{d.AMOUNT})</option>{/each}
            </select>
          </div>
          <div class="form-group">
            <label>Upload CSV</label>
            <input type="file" accept=".csv" on:change={e => clearFile = e.target.files[0]} required />
          </div>
          <button type="submit" class="btn btn-primary w-full" disabled={clearing || !clearFile || !clearDueID}>
            {#if clearing}<span class="spinner"></span> Clearing…{:else}✅ Mark as Paid{/if}
          </button>
        </form>
      </div>
    </div>
  </div>
</DashboardLayout>

<style>
  .section-title { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .due-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .due-row { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.75rem; }
  .due-amount { font-weight: 700; color: var(--warning); font-size: 0.875rem; }
  code { background: rgba(255,255,255,0.08); padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.8rem; }
</style>
