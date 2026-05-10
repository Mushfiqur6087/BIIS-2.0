<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { student } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let dues = [], loading = true, error = '';
  let total = 0;

  onMount(async () => {
    try {
      const data = await student.dues();
      dues = data.dues || [];
      total = dues.reduce((s, d) => s + Number(d.AMOUNT || 0), 0);
    } catch (e) { error = e.message; }
    finally { loading = false; }
  });
</script>

<svelte:head><title>BIIS 2.0 — My Dues</title></svelte:head>

<DashboardLayout role="student" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Financial Dues</h1>
      <p>Outstanding dues and payment status</p>
    </div>

    {#if error}<div class="alert alert-error">{error}</div>{/if}
    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else}
      <div class="grid-3 mb-6">
        <div class="stat-card">
          <div class="label">Total Dues</div>
          <div class="value">{dues.length}</div>
          <div class="sub">outstanding items</div>
        </div>
        <div class="stat-card">
          <div class="label">Total Amount</div>
          <div class="value" style="color:var(--danger)">৳{total.toLocaleString()}</div>
        </div>
      </div>

      {#if dues.length}
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Due ID</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {#each dues as d}
                  <tr>
                    <td><span class="badge badge-accent">{d.DUE_ID}</span></td>
                    <td>{d.DESCRIPTION}</td>
                    <td class="font-semibold">৳{Number(d.AMOUNT).toLocaleString()}</td>
                    <td>
                      {#if d.STATUS === 'paid' || d.STATUS === 'Paid'}
                        <span class="badge badge-success">Paid</span>
                      {:else}
                        <span class="badge badge-danger">Unpaid</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {:else}
        <div class="empty-state">
          <span style="font-size:3rem;">✅</span>
          <h3 class="mt-4">No dues outstanding!</h3>
          <p class="text-muted text-sm">You have no pending financial obligations.</p>
        </div>
      {/if}
    {/if}
  </div>
</DashboardLayout>

<style>
  .empty-state { text-align: center; padding: 4rem 2rem; }
</style>
