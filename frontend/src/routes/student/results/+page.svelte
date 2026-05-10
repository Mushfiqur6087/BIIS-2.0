<script>
  import { user } from '$lib/stores/auth.js';
  import { student } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let level = '1', term = '1', loading = false, data = null, error = '';

  const levels = ['1','2','3','4'];
  const terms  = ['1','2'];

  async function fetchResults() {
    loading = true; error = ''; data = null;
    try { data = await student.results('L' + level, 'T' + term); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  }

  function gradeColor(g) {
    if (!g) return 'badge-info';
    if (g === 'A+' || g === 'A') return 'badge-success';
    if (g === 'B+' || g === 'B') return 'badge-info';
    if (g === 'C+' || g === 'C') return 'badge-warning';
    return 'badge-danger';
  }
</script>

<svelte:head><title>BIIS 2.0 — My Results</title></svelte:head>

<DashboardLayout role="student" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Academic Results</h1>
      <p>View grades and CGPA for each semester</p>
    </div>

    <!-- Semester picker -->
    <div class="picker card mb-6">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="form-group" style="margin:0; min-width:140px;">
          <label>Level</label>
          <select bind:value={level}>
            {#each levels as l}<option value={l}>Level {l}</option>{/each}
          </select>
        </div>
        <div class="form-group" style="margin:0; min-width:140px;">
          <label>Term</label>
          <select bind:value={term}>
            {#each terms as t}<option value={t}>Term {t}</option>{/each}
          </select>
        </div>
        <button class="btn btn-primary" on:click={fetchResults} disabled={loading}>
          {#if loading}<span class="spinner"></span>{:else}View Results{/if}
        </button>
      </div>
    </div>

    {#if error}<div class="alert alert-error">{error}</div>{/if}

    {#if data}
      <!-- CGPA summary cards -->
      <div class="grid-3 mb-6">
        <div class="stat-card">
          <div class="label">Semester</div>
          <div class="value">L{data.level?.replace('L','')} T{data.term?.replace('T','')}</div>
        </div>
        <div class="stat-card">
          <div class="label">Term CGPA</div>
          <div class="value">{data.termCgpa ?? '—'}</div>
        </div>
        <div class="stat-card">
          <div class="label">Cumulative CGPA</div>
          <div class="value">{data.totalCgpa ?? '—'}</div>
        </div>
      </div>

      <!-- Grade table -->
      {#if data.grades?.length}
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Course ID</th><th>Course Title</th><th>Credits</th><th>Grade</th><th>Grade Points</th></tr>
              </thead>
              <tbody>
                {#each data.grades as g}
                  <tr>
                    <td><span class="badge badge-accent">{g.COURSE_ID}</span></td>
                    <td>{g.COURSE_TITLE ?? '—'}</td>
                    <td>{g.CREDIT ?? '—'}</td>
                    <td><span class="badge {gradeColor(g.GRADE)}">{g.GRADE ?? 'N/A'}</span></td>
                    <td>{g.GRADE_POINT ?? '—'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {:else}
        <div class="empty-state">No grades found for this semester.</div>
      {/if}
    {/if}
  </div>
</DashboardLayout>

<style>
  .picker { padding: 1.25rem; }
  .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }
</style>
