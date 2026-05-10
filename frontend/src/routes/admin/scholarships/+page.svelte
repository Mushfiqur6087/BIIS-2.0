<script>
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  // Scholarship form
  let scholForm = { title: '', description: '', amount: '' };
  let scholLoading = false, scholSuccess = false, scholError = '';

  // Due type form
  let dueForm = { Description: '', Amount: '' };
  let dueLoading = false, dueSuccess = false, dueError = '';

  async function addScholarship(e) {
    e.preventDefault();
    scholLoading = true; scholError = ''; scholSuccess = false;
    try {
      await admin.addScholarship(scholForm);
      scholSuccess = true;
      scholForm = { title: '', description: '', amount: '' };
    } catch (err) { scholError = err.message; }
    finally { scholLoading = false; }
  }

  async function addDueType(e) {
    e.preventDefault();
    dueLoading = true; dueError = ''; dueSuccess = false;
    try {
      await admin.addDueType(dueForm);
      dueSuccess = true;
      dueForm = { Description: '', Amount: '' };
    } catch (err) { dueError = err.message; }
    finally { dueLoading = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Scholarships & Dues</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Scholarships & Dues</h1>
      <p>Create scholarship types and manage student due categories</p>
    </div>

    <div class="grid-2">
      <!-- Add Scholarship -->
      <div class="card">
        <h2 class="section-title mb-4">🏆 Add Scholarship Type</h2>
        {#if scholSuccess}<div class="alert alert-success mb-4">✓ Scholarship added!</div>{/if}
        {#if scholError}<div class="alert alert-error mb-4">{scholError}</div>{/if}
        <form on:submit={addScholarship}>
          <div class="form-group">
            <label for="stitle">Title</label>
            <input id="stitle" bind:value={scholForm.title} placeholder="e.g. Merit Scholarship" required />
          </div>
          <div class="form-group">
            <label for="sdesc">Description</label>
            <textarea id="sdesc" bind:value={scholForm.description} rows="3" placeholder="Details about this scholarship…" required></textarea>
          </div>
          <div class="form-group">
            <label for="samount">Amount (৳)</label>
            <input id="samount" type="number" bind:value={scholForm.amount} placeholder="e.g. 5000" required />
          </div>
          <button type="submit" class="btn btn-primary w-full" disabled={scholLoading}>
            {#if scholLoading}<span class="spinner"></span>{:else}Add Scholarship{/if}
          </button>
        </form>
      </div>

      <!-- Add Due Type -->
      <div class="card">
        <h2 class="section-title mb-4">💳 Add Due Category</h2>
        {#if dueSuccess}<div class="alert alert-success mb-4">✓ Due type added!</div>{/if}
        {#if dueError}<div class="alert alert-error mb-4">{dueError}</div>{/if}
        <form on:submit={addDueType}>
          <div class="form-group">
            <label for="ddesc">Description</label>
            <input id="ddesc" bind:value={dueForm.Description} placeholder="e.g. Hall Fee" required />
          </div>
          <div class="form-group">
            <label for="damount">Amount (৳)</label>
            <input id="damount" type="number" bind:value={dueForm.Amount} placeholder="e.g. 1200" required />
          </div>
          <div class="info-box mt-4 mb-4">
            <p class="text-sm text-muted">After adding a due type, go to <a href="/admin/dues" class="text-accent">Dues page</a> to assign dues to students via CSV upload.</p>
          </div>
          <button type="submit" class="btn btn-primary w-full" disabled={dueLoading}>
            {#if dueLoading}<span class="spinner"></span>{:else}Add Due Type{/if}
          </button>
        </form>
      </div>
    </div>
  </div>
</DashboardLayout>

<style>
  .section-title { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .info-box { background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); border-radius: var(--radius-sm); padding: 0.85rem; }
</style>
