<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { student } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let data = null, loading = true, error = '';
  let selectedOption = '', applying = false, applySuccess = false;

  onMount(async () => {
    try { data = await student.scholarship(); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });

  async function apply() {
    if (!selectedOption) return;
    applying = true; error = '';
    try {
      await student.applyScholarship(selectedOption);
      applySuccess = true;
      const d = await student.scholarship();
      data = d;
    } catch (e) { error = e.message; }
    finally { applying = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Scholarship</title></svelte:head>

<DashboardLayout role="student" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Scholarship</h1>
      <p>Apply for financial aid and track your application status</p>
    </div>

    {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}
    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else if data}
      <!-- Status banner -->
      {#if data.applied}
        <div class="status-banner" class:approved={data.approved}>
          {#if data.approved}
            <span class="banner-icon">🏆</span>
            <div>
              <strong>Scholarship Approved!</strong>
              <p>Your scholarship application has been approved by your advisor.</p>
            </div>
          {:else}
            <span class="banner-icon">⏳</span>
            <div>
              <strong>Application Pending</strong>
              <p>Your application is under review. Status: <span class="text-warning">{data.status}</span></p>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Available scholarships -->
      {#if !data.applied}
        <div class="card">
          <h2 class="section-title mb-4">Available Scholarships</h2>
          {#if applySuccess}
            <div class="alert alert-success mb-4">✓ Application submitted! A PDF has been generated.</div>
          {/if}
          <div class="schol-list">
            {#each data.options as opt}
              <label class="schol-option" class:selected={selectedOption === opt.SCHOLARSHIP_ID}>
                <input type="radio" bind:group={selectedOption} value={opt.SCHOLARSHIP_ID} />
                <div class="schol-info">
                  <div class="schol-title">{opt.TITLE}</div>
                  <div class="schol-desc text-muted text-sm">{opt.DESCRIPTION}</div>
                  <div class="schol-amount">৳{Number(opt.AMOUNT).toLocaleString()}</div>
                </div>
                {#if selectedOption === opt.SCHOLARSHIP_ID}
                  <span class="check">✓</span>
                {/if}
              </label>
            {:else}
              <p class="text-muted">No scholarships available at this time.</p>
            {/each}
          </div>
          {#if data.options?.length}
            <button class="btn btn-primary mt-4" disabled={!selectedOption || applying} on:click={apply}>
              {#if applying}<span class="spinner"></span> Submitting…{:else}Apply for Scholarship{/if}
            </button>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</DashboardLayout>

<style>
  .section-title { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .status-banner { display: flex; align-items: center; gap: 1.25rem; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; }
  .status-banner.approved { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3); }
  .banner-icon { font-size: 2rem; flex-shrink: 0; }
  .text-warning { color: var(--warning); }
  .schol-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .schol-option { display: flex; align-items: center; gap: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 1rem 1.25rem; cursor: pointer; transition: all var(--transition); position: relative; }
  .schol-option input { display: none; }
  .schol-option:hover { border-color: var(--accent); }
  .schol-option.selected { border-color: var(--accent); background: var(--accent-dim); }
  .schol-info { flex: 1; }
  .schol-title { font-weight: 600; font-size: 0.9rem; }
  .schol-desc { margin-top: 0.2rem; }
  .schol-amount { color: var(--success); font-weight: 700; font-size: 1rem; margin-top: 0.4rem; }
  .check { color: var(--accent); font-weight: 700; font-size: 1.1rem; }
</style>
