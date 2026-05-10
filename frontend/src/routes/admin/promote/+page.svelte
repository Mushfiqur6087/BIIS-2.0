<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let promoteData = null, loading = true, error = '';
  let promoting = false, success = false;

  onMount(load);

  async function load() {
    loading = true; error = '';
    try { promoteData = await admin.promoteData(); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  }

  async function runPromotion() {
    promoting = true; error = '';
    try {
      await admin.runPromotion();
      success = true;
      await load();
    } catch (e) { error = e.message; }
    finally { promoting = false; }
  }

  $: ungradedCount = promoteData?.count?.TOTAL_NOT_GRADED ?? 0;
  $: eligibleCount = promoteData?.resultArray?.length ?? 0;
  $: failedCount   = promoteData?.failedStudents?.length ?? 0;
</script>

<svelte:head><title>BIIS 2.0 — Promote Students</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Student Promotion</h1>
      <p>Advance students to the next level/term after all grades are submitted</p>
    </div>

    {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else}
      <!-- Summary stats -->
      <div class="grid-3 mb-6">
        <div class="stat-card">
          <div class="label">Awaiting Grades</div>
          <div class="value" style="color: {ungradedCount > 0 ? 'var(--danger)' : 'var(--success)'}">
            {ungradedCount}
          </div>
          <div class="sub">courses not yet graded</div>
        </div>
        <div class="stat-card">
          <div class="label">Eligible for Promotion</div>
          <div class="value" style="color: var(--success)">{eligibleCount}</div>
          <div class="sub">students passed all courses</div>
        </div>
        <div class="stat-card">
          <div class="label">Failed / Held Back</div>
          <div class="value" style="color: var(--warning)">{failedCount}</div>
          <div class="sub">students need remediation</div>
        </div>
      </div>

      <!-- Action -->
      <div class="card mb-6" style="max-width: 520px;">
        {#if success}
          <div class="alert alert-success mb-4">🎓 Promotion completed! Students have been advanced.</div>
        {/if}

        {#if ungradedCount > 0}
          <div class="alert alert-error mb-4">
            ⚠ Cannot promote — <strong>{ungradedCount}</strong> course(s) still have unsubmitted grades.
            Teachers must submit all grades before promotion can run.
          </div>
        {/if}

        <button
          class="btn btn-primary w-full"
          disabled={promoting || ungradedCount > 0}
          on:click={runPromotion}
        >
          {#if promoting}
            <span class="spinner"></span> Promoting students…
          {:else}
            🎓 Run Promotion for All Eligible Students
          {/if}
        </button>

        {#if ungradedCount === 0 && eligibleCount === 0 && !success}
          <p class="text-muted text-sm mt-3 text-center">No students are currently eligible for promotion.</p>
        {/if}
      </div>

      <!-- Eligible students table -->
      {#if promoteData?.resultArray?.length}
        <h2 class="section-title mb-3">Students Eligible for Promotion</h2>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Current Level</th>
                  <th>Current Term</th>
                  <th>Promotes To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {#each promoteData.resultArray as r}
                  <tr>
                    <td><span class="badge badge-accent">{r.sid}</span></td>
                    <td>{r.level ?? '—'}</td>
                    <td>{r.term ?? '—'}</td>
                    <td><strong>{r.nextLevel} / {r.nextTerm}</strong></td>
                    <td><span class="badge badge-success">Pass</span></td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

      <!-- Failed students table -->
      {#if promoteData?.failedStudents?.length}
        <h2 class="section-title mb-3 mt-6">Students Not Promoted (Failed)</h2>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Student ID</th><th>Status</th></tr></thead>
              <tbody>
                {#each promoteData.failedStudents as s}
                  <tr>
                    <td><span class="badge badge-accent">{s.STUDENT_ID ?? s}</span></td>
                    <td><span class="badge badge-danger">Failed</span></td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</DashboardLayout>

<style>
  .section-title { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
</style>
