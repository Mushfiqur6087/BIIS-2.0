<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { teacher } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let scholarships = [], loading = true, error = '';
  let selected = [], submitting = false, success = false;

  onMount(async () => {
    try { ({ scholarships } = await teacher.scholarships()); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });

  function toggle(id) {
    if (selected.includes(id)) selected = selected.filter(s => s !== id);
    else selected = [...selected, id];
  }

  async function approve() {
    submitting = true;
    try {
      await teacher.approveScholarship(selected);
      success = true;
      const d = await teacher.scholarships();
      scholarships = d.scholarships || [];
      selected = [];
    } catch (e) { error = e.message; }
    finally { submitting = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Scholarship Approvals</title></svelte:head>

<DashboardLayout role="teacher" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Scholarship Approvals</h1>
      <p>Review and approve student scholarship applications</p>
    </div>

    {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}
    {#if success}<div class="alert alert-success mb-4">✓ Scholarship(s) approved!</div>{/if}

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span></div>
    {:else if !scholarships?.length}
      <div class="empty-state">
        <span style="font-size:3rem;">🏆</span>
        <h3 class="mt-4">No pending scholarship applications</h3>
        <p class="text-muted text-sm">Applications from your advisees will appear here.</p>
      </div>
    {:else}
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="width:40px"><input type="checkbox" on:change={e => selected = e.target.checked ? scholarships.map(s => s.APPLICATION_ID) : []} /></th>
                <th>Student ID</th><th>Scholarship</th><th>Amount</th><th>Status</th><th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {#each scholarships as s}
                {@const isSelected = selected.includes(s.APPLICATION_ID)}
                <tr class:selected={isSelected}>
                  <td><input type="checkbox" checked={isSelected} on:change={() => toggle(s.APPLICATION_ID)} /></td>
                  <td><span class="badge badge-accent">{s.STUDENT_ID}</span></td>
                  <td>{s.TITLE}</td>
                  <td class="text-success font-semibold">৳{Number(s.AMOUNT).toLocaleString()}</td>
                  <td><span class="badge badge-warning">{s.STATUS}</span></td>
                  <td>
                    <a href="/api/teacher/approve-scholarship/pdf/{s.STUDENT_ID}" target="_blank" class="btn btn-ghost btn-sm">📄 PDF</a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      {#if selected.length}
        <div class="action-bar">
          <span class="text-sm">{selected.length} selected</span>
          <button class="btn btn-primary" disabled={submitting} on:click={approve}>
            {#if submitting}<span class="spinner"></span>{:else}🏆 Approve Selected{/if}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</DashboardLayout>

<style>
  tbody tr.selected { background: var(--accent-dim) !important; }
  .action-bar { position: sticky; bottom: 1rem; background: var(--bg-surface); border: 1px solid var(--accent); border-radius: var(--radius-md); padding: 1rem 1.5rem; margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
  .empty-state { text-align: center; padding: 4rem 2rem; }
  .text-success { color: var(--success); }
</style>
