<script>
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  // Add Course form
  let courseForm = { option: ['CSE','CSE','3','11'], courseID: '', courseTitle: '' };
  let courseLoading = false, courseSuccess = false, courseError = '';
  const depts = ['CSE','EEE','BME','ME','CE','IPE','WRE','URP'];
  const credits = ['1','2','3','4'];
  const levelTerms = ['11','12','21','22','31','32','41','42'];
  const ltLabels = { '11':'L1T1','12':'L1T2','21':'L2T1','22':'L2T2','31':'L3T1','32':'L3T2','41':'L4T1','42':'L4T2' };

  async function addCourse(e) {
    e.preventDefault();
    courseLoading = true; courseError = ''; courseSuccess = false;
    try {
      await admin.addCourse({ ...courseForm });
      courseSuccess = true;
      courseForm = { option: ['CSE','CSE','3','11'], courseID: '', courseTitle: '' };
    } catch (err) { courseError = err.data?.error || err.message; }
    finally { courseLoading = false; }
  }

  // Assign Teacher form
  let assignForm = { teacherID: '', courseID: '' };
  let assignLoading = false, assignSuccess = false, assignError = '';

  async function assignTeacher(e) {
    e.preventDefault();
    assignLoading = true; assignError = ''; assignSuccess = false;
    try {
      await admin.assignTeacher(assignForm);
      assignSuccess = true;
      assignForm = { teacherID: '', courseID: '' };
    } catch (err) { assignError = err.data?.error || err.message; }
    finally { assignLoading = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Courses</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Course Management</h1>
      <p>Add new courses and assign teachers to courses</p>
    </div>

    <div class="grid-2">
      <!-- Add Course -->
      <div class="card">
        <h2 class="section-title mb-4">Add New Course</h2>
        {#if courseSuccess}<div class="alert alert-success mb-4">✓ Course created!</div>{/if}
        {#if courseError}<div class="alert alert-error mb-4">{courseError}</div>{/if}
        <form on:submit={addCourse}>
          <div class="form-group">
            <label>Department</label>
            <select bind:value={courseForm.option[1]}>
              {#each depts as d}<option value={d}>{d}</option>{/each}
            </select>
          </div>
          <div class="form-group">
            <label>Course Prefix</label>
            <select bind:value={courseForm.option[0]}>
              {#each depts as d}<option value={d}>{d}</option>{/each}
            </select>
          </div>
          <div class="form-group">
            <label for="cid">Course Number</label>
            <input id="cid" type="number" bind:value={courseForm.courseID} placeholder="e.g. 101" required />
          </div>
          <div class="form-group">
            <label for="ctitle">Course Title</label>
            <input id="ctitle" bind:value={courseForm.courseTitle} placeholder="e.g. Data Structures" required />
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Credits</label>
              <select bind:value={courseForm.option[2]}>
                {#each credits as c}<option value={c}>{c}</option>{/each}
              </select>
            </div>
            <div class="form-group">
              <label>Level / Term</label>
              <select bind:value={courseForm.option[3]}>
                {#each levelTerms as lt}<option value={lt}>{ltLabels[lt]}</option>{/each}
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-primary w-full" disabled={courseLoading}>
            {#if courseLoading}<span class="spinner"></span> Creating…{:else}Create Course{/if}
          </button>
        </form>
      </div>

      <!-- Assign Teacher -->
      <div class="card">
        <h2 class="section-title mb-4">Assign Teacher to Course</h2>
        {#if assignSuccess}<div class="alert alert-success mb-4">✓ Teacher assigned!</div>{/if}
        {#if assignError}<div class="alert alert-error mb-4">{assignError}</div>{/if}
        <form on:submit={assignTeacher}>
          <div class="form-group">
            <label for="ateacher">Teacher ID</label>
            <input id="ateacher" type="number" bind:value={assignForm.teacherID} placeholder="e.g. 7001" required />
          </div>
          <div class="form-group">
            <label for="acourse">Course ID</label>
            <input id="acourse" bind:value={assignForm.courseID} placeholder="e.g. CSE 101" required />
          </div>
          <div class="info-box mt-4">
            <p class="text-sm text-muted">ℹ Teacher and course must belong to the same department. You can also bulk-assign via CSV from the assign page.</p>
          </div>
          <button type="submit" class="btn btn-primary w-full mt-4" disabled={assignLoading}>
            {#if assignLoading}<span class="spinner"></span> Assigning…{:else}Assign Teacher{/if}
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
