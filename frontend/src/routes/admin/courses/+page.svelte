<script>
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  // ── Add single course ─────────────────────────────────────
  const depts = ['CSE','EEE','BME','ME','CE','IPE','WRE','URP'];
  const credits = ['1','2','3','4'];
  const levelTerms = ['11','12','21','22','31','32','41','42'];
  const ltLabels = { '11':'L1 T1','12':'L1 T2','21':'L2 T1','22':'L2 T2','31':'L3 T1','32':'L3 T2','41':'L4 T1','42':'L4 T2' };

  let courseForm = { option: ['CSE','CSE','3','11'], courseID: '', courseTitle: '' };
  let cSaving = false, cSuccess = false, cError = '';

  async function addCourse(e) {
    e.preventDefault();
    cSaving = true; cError = ''; cSuccess = false;
    try {
      await admin.addCourse({ ...courseForm });
      cSuccess = true;
      courseForm = { option: ['CSE','CSE','3','11'], courseID: '', courseTitle: '' };
    } catch (err) { cError = err.data?.error || err.message; }
    finally { cSaving = false; }
  }

  // ── Single assign teacher ──────────────────────────────────
  let assignForm = { teacherID: '', courseID: '' };
  let aSaving = false, aSuccess = false, aError = '';

  async function assignTeacher(e) {
    e.preventDefault();
    aSaving = true; aError = ''; aSuccess = false;
    try {
      await admin.assignTeacher(assignForm);
      aSuccess = true;
      assignForm = { teacherID: '', courseID: '' };
    } catch (err) { aError = err.data?.error || err.message; }
    finally { aSaving = false; }
  }

  // ── Bulk CSV assign teacher ────────────────────────────────
  let csvFile = null, bSaving = false, bResult = null, bError = '';

  async function bulkAssign(e) {
    e.preventDefault();
    if (!csvFile) return;
    bSaving = true; bError = ''; bResult = null;
    try {
      const fd = new FormData();
      fd.append('File', csvFile);
      bResult = await admin.assignTeacherCSV(fd);
      csvFile = null;
      const el = document.getElementById('bulk-file');
      if (el) el.value = '';
    } catch (err) { bError = err.data?.error || err.message; }
    finally { bSaving = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Course Management</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Course Management</h1>
      <p>Create courses, assign teachers individually or in bulk</p>
    </div>

    <!-- Row 1: Add course + Single assign -->
    <div class="grid-2 mb-6">
      <!-- Add course -->
      <div class="card">
        <h2 class="section-title mb-4">📚 Add New Course</h2>
        {#if cSuccess}<div class="alert alert-success mb-3">✓ Course created!</div>{/if}
        {#if cError}<div class="alert alert-error mb-3">{cError}</div>{/if}
        <form on:submit={addCourse}>
          <div class="form-group">
            <label>Course Prefix (Dept)</label>
            <select bind:value={courseForm.option[0]}>
              {#each depts as d}<option value={d}>{d}</option>{/each}
            </select>
          </div>
          <div class="form-group">
            <label>Belongs to Department</label>
            <select bind:value={courseForm.option[1]}>
              {#each depts as d}<option value={d}>{d}</option>{/each}
            </select>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label for="cnum">Course Number</label>
              <input id="cnum" type="number" bind:value={courseForm.courseID} placeholder="e.g. 101" required />
            </div>
            <div class="form-group">
              <label>Credits</label>
              <select bind:value={courseForm.option[2]}>
                {#each credits as c}<option value={c}>{c} cr</option>{/each}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="ctitle">Course Title</label>
            <input id="ctitle" bind:value={courseForm.courseTitle} placeholder="e.g. Data Structures" required />
          </div>
          <div class="form-group">
            <label>Level / Term</label>
            <select bind:value={courseForm.option[3]}>
              {#each levelTerms as lt}<option value={lt}>{ltLabels[lt]}</option>{/each}
            </select>
          </div>
          <button type="submit" class="btn btn-primary w-full" disabled={cSaving}>
            {#if cSaving}<span class="spinner"></span> Creating…{:else}📚 Create Course{/if}
          </button>
        </form>
      </div>

      <!-- Single assign -->
      <div class="card">
        <h2 class="section-title mb-4">🔗 Assign Teacher (Single)</h2>
        {#if aSuccess}<div class="alert alert-success mb-3">✓ Teacher assigned!</div>{/if}
        {#if aError}<div class="alert alert-error mb-3">{aError}</div>{/if}
        <form on:submit={assignTeacher}>
          <div class="form-group">
            <label for="tid">Teacher ID</label>
            <input id="tid" type="number" bind:value={assignForm.teacherID} placeholder="e.g. 7001" required />
          </div>
          <div class="form-group">
            <label for="cid">Course ID</label>
            <input id="cid" bind:value={assignForm.courseID} placeholder="e.g. CSE 101" required />
            <p class="hint">Teacher and course must be in the same department</p>
          </div>
          <button type="submit" class="btn btn-primary w-full" disabled={aSaving}>
            {#if aSaving}<span class="spinner"></span> Assigning…{:else}🔗 Assign Teacher{/if}
          </button>
        </form>

        <!-- Bulk CSV assign (same card, below) -->
        <hr class="divider" />

        <h2 class="section-title mb-3">📋 Bulk Assign via CSV</h2>
        <div class="csv-example mb-3">
          <div class="csv-label">CSV columns required:</div>
          <pre class="csv-preview">TEACHER_ID,COURSE_ID
7001,CSE 101
7002,CSE 201</pre>
        </div>
        {#if bResult}<div class="alert alert-success mb-3">✓ {bResult.count} assignments done!</div>{/if}
        {#if bError}<div class="alert alert-error mb-3">{bError}</div>{/if}
        <form on:submit={bulkAssign}>
          <div class="form-group">
            <label for="bulk-file">Upload CSV</label>
            <input id="bulk-file" type="file" accept=".csv"
              on:change={e => csvFile = e.target.files[0]} required />
          </div>
          <button type="submit" class="btn btn-primary w-full" disabled={bSaving || !csvFile}>
            {#if bSaving}<span class="spinner"></span> Processing…{:else}📋 Bulk Assign from CSV{/if}
          </button>
        </form>
      </div>
    </div>

    <div class="info-box">
      <p class="text-sm">💡 For dedicated bulk assign management, go to <a href="/admin/assign" class="text-accent">Assign Teachers page</a>.</p>
    </div>
  </div>
</DashboardLayout>

<style>
  .section-title { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .hint { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.3rem; }
  .divider { border: none; border-top: 1px solid var(--glass-border); margin: 1.5rem 0; }
  .csv-example { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.75rem; }
  .csv-label { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem; }
  .csv-preview { font-family: monospace; font-size: 0.78rem; color: var(--text-secondary); margin: 0; white-space: pre; }
  .info-box { background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); border-radius: var(--radius-sm); padding: 1rem; color: var(--text-secondary); }
</style>
