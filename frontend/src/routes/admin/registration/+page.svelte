<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  // Registration status
  let status = null, regLoading = true, toggling = false;
  // Promotion
  let promoteData = null, promLoading = true, promoting = false;
  let promoteSuccess = false;
  let error = '';

  onMount(async () => {
    try {
      const [r, p] = await Promise.all([admin.registration(), admin.promoteData()]);
      status = r.status;
      promoteData = p;
    } catch (e) { error = e.message; }
    finally { regLoading = false; promLoading = false; }
  });

  async function toggleReg(action) {
    toggling = true;
    try {
      await admin.setRegistration(action);
      const r = await admin.registration();
      status = r.status;
    } catch (e) { error = e.message; }
    finally { toggling = false; }
  }

  async function runPromotion() {
    promoting = true;
    try {
      await admin.runPromotion();
      promoteSuccess = true;
      const [r, p] = await Promise.all([admin.registration(), admin.promoteData()]);
      status = r.status;
      promoteData = p;
    } catch (e) { error = e.message; }
    finally { promoting = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Registration & Promotion</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Registration & Promotion</h1>
      <p>Control course registration window and promote students to next level</p>
    </div>

    {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}

    <!-- Registration toggle -->
    <div class="grid-2 mb-6">
      <div class="card">
        <div class="label">Registration Status</div>
        <div class="status-display" class:open={status?.REGISTRATION_STATUS === 'Open'}>
          {regLoading ? '…' : (status?.REGISTRATION_STATUS || 'Unknown')}
        </div>
        <p class="text-muted text-sm mt-2">
          {status?.REGISTRATION_STATUS === 'Open'
            ? 'Students can currently register for courses.'
            : 'Course registration is currently closed.'}
        </p>
        <div class="flex gap-3 mt-4">
          <button class="btn btn-primary flex-1" disabled={toggling || status?.REGISTRATION_STATUS === 'Open'}
            on:click={() => toggleReg('Open')}>Open</button>
          <button class="btn btn-danger flex-1" disabled={toggling || status?.REGISTRATION_STATUS === 'Close'}
            on:click={() => toggleReg('Close')}>Close</button>
        </div>
      </div>

      <!-- Promotion -->
      <div class="card">
        <div class="label">Student Promotion</div>
        {#if promoteData}
          <div class="promo-stats">
            <div class="promo-stat">
              <span class="value">{promoteData.count?.TOTAL_NOT_GRADED ?? '—'}</span>
              <span class="sub">Awaiting Grades</span>
            </div>
            <div class="promo-stat">
              <span class="value">{promoteData.failedStudents?.length ?? 0}</span>
              <span class="sub">Failed Students</span>
            </div>
            <div class="promo-stat">
              <span class="value">{promoteData.resultArray?.length ?? 0}</span>
              <span class="sub">Ready to Promote</span>
            </div>
          </div>
        {/if}
        {#if promoteSuccess}
          <div class="alert alert-success mt-3">✓ Promotion completed successfully!</div>
        {:else}
          <button class="btn btn-primary w-full mt-4" disabled={promoting || (promoteData?.count?.TOTAL_NOT_GRADED > 0)}
            on:click={runPromotion}>
            {#if promoting}<span class="spinner"></span> Promoting…{:else}🎓 Promote All Students{/if}
          </button>
          {#if promoteData?.count?.TOTAL_NOT_GRADED > 0}
            <p class="text-sm text-warning mt-2">⚠ Cannot promote — {promoteData.count.TOTAL_NOT_GRADED} student(s) still awaiting grades.</p>
          {/if}
        {/if}
      </div>
    </div>

    <!-- Eligible students table -->
    {#if promoteData?.resultArray?.length}
      <div class="card">
        <h2 class="section-title mb-4">Students Eligible for Promotion</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Student ID</th><th>Status</th><th>Next Level</th><th>Next Term</th></tr></thead>
            <tbody>
              {#each promoteData.resultArray as r}
                <tr>
                  <td><span class="badge badge-accent">{r.sid}</span></td>
                  <td><span class="badge badge-success">Pass</span></td>
                  <td>{r.nextLevel}</td>
                  <td>{r.nextTerm}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
</DashboardLayout>

<style>
  .label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
  .status-display { font-size: 2rem; font-weight: 800; color: var(--danger); }
  .status-display.open { color: var(--success); }
  .flex-1 { flex: 1; }
  .promo-stats { display: flex; gap: 1rem; margin-top: 0.5rem; }
  .promo-stat { flex: 1; background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.85rem; text-align: center; }
  .promo-stat .value { display: block; font-size: 1.5rem; font-weight: 700; }
  .promo-stat .sub { font-size: 0.7rem; color: var(--text-muted); }
  .section-title { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .text-warning { color: var(--warning); }
</style>
