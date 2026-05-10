<script>
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  // ── Single assignment ──────────────────────────────────────
  let singleForm = { teacherID: '', courseID: '' };
  let sSaving = false, sSuccess = false, sError = '';

  async function assignSingle(e) {
    e.preventDefault();
    sSaving = true; sError = ''; sSuccess = false;
    try {
      await admin.assignTeacher(singleForm);
      sSuccess = true;
      singleForm = { teacherID: '', courseID: '' };
    } catch (err) { sError = err.data?.error || err.message; }
    finally { sSaving = false; }
  }

  // ── Bulk CSV assignment ────────────────────────────────────
  let csvFile = null, bSaving = false, bResult = null, bError = '';

  async function assignCSV(e) {
    e.preventDefault();
    if (!csvFile) return;
    bSaving = true; bError = ''; bResult = null;
    try {
      const fd = new FormData();
      fd.append('File', csvFile);
      const r = await admin.assignTeacherCSV(fd);
      bResult = r;
      csvFile = null;
      // reset file input
      const el = document.getElementById('csv-file');
      if (el) el.value = '';
    } catch (err) { bError = err.data?.error || err.message; }
    finally { bSaving = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Assign Teachers</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Assign Teachers to Courses</h1>
      <p>Assign individually or upload a CSV for bulk assignment</p>
    </div>

    <div class="grid-2">
      <!-- Single assignment -->
      <div class="card">
        <h2 class="section-title mb-4">🔗 Single Assignment</h2>
        {#if sSuccess}<div class="alert alert-success mb-4">✓ Teacher assigned successfully!</div>{/if}
        {#if sError}<div class="alert alert-error mb-4">{sError}</div>{/if}

        <form on:submit={assignSingle}>
          <div class="form-group">
            <label for="teacher-id">Teacher ID</label>
            <input id="teacher-id" type="number" bind:value={singleForm.teacherID}
              placeholder="e.g. 7001" required />
            <p class="hint">Must be a registered teacher in the system</p>
          </div>
          <div class="form-group">
            <label for="course-id">Course ID</label>
            <input id="course-id" bind:value={singleForm.courseID}
              placeholder="e.g. CSE 101" required />
            <p class="hint">Teacher and course must belong to the same department</p>
          </div>
          <button type="submit" class="btn btn-primary w-full" disabled={sSaving}>
            {#if sSaving}<span class="spinner"></span> Assigning…{:else}🔗 Assign Teacher{/if}
          </button>
        </form>
      </div>

      <!-- Bulk CSV assignment -->
      <div class="card">
        <h2 class="section-title mb-2">📋 Bulk CSV Assignment</h2>
        <p class="text-sm text-muted mb-4">
          Upload a CSV file with the following columns:<br />
          <code>TEACHER_ID</code>, <code>COURSE_ID</code>
        </p>

        {#if bResult}
          <div class="alert alert-success mb-4">
            ✓ Done! <strong>{bResult.count}</strong> assignments processed.
          </div>
        {/if}
        {#if bError}<div class="alert alert-error mb-4">{bError}</div>{/if}

        <div class="csv-example mb-4">
          <div class="csv-label">Example CSV format:</div>
          <pre class="csv-preview">TEACHER_ID,COURSE_ID
7001,CSE 101
7002,CSE 201
7001,CSE 301</pre>
        </div>

        <form on:submit={assignCSV}>
          <div class="form-group">
            <label for="csv-file">Upload CSV</label>
            <input id="csv-file" type="file" accept=".csv"
              on:change={e => csvFile = e.target.files[0]} required />
          </div>
          <button type="submit" class="btn btn-primary w-full"
            disabled={bSaving || !csvFile}>
            {#if bSaving}<span class="spinner"></span> Processing…{:else}📋 Bulk Assign from CSV{/if}
          </button>
        </form>
      </div>
    </div>

    <!-- Info box -->
    <div class="info-box mt-4">
      <p class="text-sm">
        💡 To create new courses first, go to <a href="/admin/courses" class="text-accent">Course Management</a>.
        Assignments will fail if the teacher's department doesn't match the course's department.
      </p>
    </div>
  </div>
</DashboardLayout>

<style>
  .section-title { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .hint { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.3rem; }
  .info-box { background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); border-radius: var(--radius-sm); padding: 1rem; color: var(--text-secondary); }
  .csv-example { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.85rem; }
  .csv-label { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; }
  .csv-preview { font-family: monospace; font-size: 0.8rem; color: var(--text-secondary); margin: 0; white-space: pre; }
  code { background: rgba(255,255,255,0.08); padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.8rem; font-family: monospace; }
</style>
