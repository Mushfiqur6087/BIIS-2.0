<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let dueTypes = [], loading = true, error = '';
  let form = { Description: '', Amount: '' };
  let saving = false, success = false, saveError = '';

  onMount(async () => {
    try {
      const data = await admin.dueTypes();
      dueTypes = data.dueTypes || [];
    } catch (e) {
      error = e.message;
    } finally { loading = false; }
  });

  async function addDue(e) {
    e.preventDefault();
    saving = true; saveError = ''; success = false;
    try {
      await admin.addDueType(form);
      success = true;
      form = { Description: '', Amount: '' };
      // Refresh list
      const data = await admin.dueTypes();
      dueTypes = data.dueTypes || [];
    } catch (err) {
      saveError = err.data?.error || err.message;
    } finally { saving = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Dues Management</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Dues Management</h1>
      <p>Create due categories that can be assigned to students</p>
    </div>

    {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}

    <div class="grid-2">
      <!-- Add new due type -->
      <div class="card">
        <h2 class="section-title mb-4">💳 Add Due Category</h2>

        {#if success}<div class="alert alert-success mb-4">✓ Due type added!</div>{/if}
        {#if saveError}<div class="alert alert-error mb-4">{saveError}</div>{/if}

        <form on:submit={addDue}>
          <div class="form-group">
            <label for="due-desc">Description</label>
            <input
              id="due-desc"
              bind:value={form.Description}
              placeholder="e.g. Hall Fee, Tuition Fee, Library Fee"
              required
            />
          </div>
          <div class="form-group">
            <label for="due-amount">Amount (৳)</label>
            <input
              id="due-amount"
              type="number"
              bind:value={form.Amount}
              placeholder="e.g. 1200"
              min="1"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary w-full" disabled={saving}>
            {#if saving}<span class="spinner"></span> Adding…{:else}Add Due Type{/if}
          </button>
        </form>
      </div>

      <!-- Existing due types -->
      <div class="card">
        <h2 class="section-title mb-4">Existing Due Categories</h2>
        {#if loading}
          <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
        {:else if !dueTypes.length}
          <div class="empty-state">
            <p class="text-muted text-sm">No due types created yet.</p>
          </div>
        {:else}
          <div class="due-list">
            {#each dueTypes as d}
              <div class="due-item">
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
  </div>
</DashboardLayout>

<style>
  .section-title { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .due-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .due-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.85rem; }
  .due-amount { font-weight: 700; color: var(--warning); font-size: 0.9rem; }
  .empty-state { text-align: center; padding: 2rem; }
</style>
