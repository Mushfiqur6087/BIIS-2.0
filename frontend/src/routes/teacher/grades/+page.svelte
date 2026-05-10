<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { teacher } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let gradesData = null, loading = true, error = '';
  // Step 1: select course
  let selectedCourse = null, courseLoading = false;
  // Step 2: enter grades
  let studentList = [], grades = {}, submitting = false, success = false;

  onMount(async () => {
    try { gradesData = await teacher.grades(); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });

  async function selectCourse(courseId) {
    courseLoading = true; error = '';
    try {
      const d = await teacher.gradeStudents(courseId);
      studentList = d.studentList || [];
      selectedCourse = courseId;
      grades = {};
      studentList.forEach(s => { grades[s.STUDENT_ID] = s.GRADE || ''; });
    } catch (e) { error = e.message; }
    finally { courseLoading = false; }
  }

  async function submitGrades() {
    submitting = true; error = '';
    try {
      const gradeArray = studentList.map(s => grades[s.STUDENT_ID]);
      await teacher.submitGrades({ 'grades[]': gradeArray, courseId: selectedCourse });
      success = true;
      selectedCourse = null; studentList = [];
    } catch (e) { error = e.message; }
    finally { submitting = false; }
  }

  const gradeOptions = ['A+','A','A-','B+','B','B-','C+','C','C-','D','F','I','W'];
</script>

<svelte:head><title>BIIS 2.0 — Assign Grades</title></svelte:head>

<DashboardLayout role="teacher" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Grade Assignment</h1>
      <p>Assign final grades to students for your courses</p>
    </div>

    {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}
    {#if success}<div class="alert alert-success mb-4">✓ Grades submitted!</div>{/if}

    {#if gradesData?.registrationOpen}
      <div class="alert alert-error mb-4">⚠ Registration is currently open — grade submission is disabled until registration closes.</div>
    {/if}

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span></div>
    {:else if !selectedCourse}
      <!-- Step 1: pick a course -->
      <h2 class="section-title mb-3">Select a Course</h2>
      {#if !gradesData?.options?.length}
        <div class="empty-state">No courses assigned to you.</div>
      {:else}
        <div class="course-grid">
          {#each gradesData.options as c}
            <button class="course-card" on:click={() => selectCourse(c.COURSE_ID)} disabled={gradesData?.registrationOpen}>
              <div class="course-id">{c.COURSE_ID}</div>
              <div class="course-title">{c.COURSE_TITLE ?? ''}</div>
              <div class="text-xs text-muted mt-1">L{c.LEVEL}/T{c.TERM} · {c.CREDIT} credits</div>
            </button>
          {/each}
        </div>
      {/if}
    {:else}
      <!-- Step 2: enter grades -->
      {#if courseLoading}
        <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading students…</span></div>
      {:else}
        <div class="flex items-center gap-3 mb-4">
          <button class="btn btn-ghost btn-sm" on:click={() => selectedCourse = null}>← Back</button>
          <h2 class="font-semibold">Grading: {selectedCourse}</h2>
          <span class="badge badge-accent">{studentList.length} students</span>
        </div>

        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Student ID</th><th>Name</th><th>Current Grade</th><th>Assign Grade</th></tr></thead>
              <tbody>
                {#each studentList as s}
                  <tr>
                    <td><span class="badge badge-accent">{s.STUDENT_ID}</span></td>
                    <td>{s.FIRST_NAME} {s.LAST_NAME}</td>
                    <td>{#if s.GRADE}<span class="badge badge-info">{s.GRADE}</span>{:else}<span class="text-muted">—</span>{/if}</td>
                    <td>
                      <select bind:value={grades[s.STUDENT_ID]} class="grade-select">
                        <option value="">Select…</option>
                        {#each gradeOptions as g}<option value={g}>{g}</option>{/each}
                      </select>
                    </td>
                  </tr>
                {:else}
                  <tr><td colspan="4" class="text-center text-muted">No students enrolled</td></tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
        {#if studentList.length}
          <button class="btn btn-primary mt-4" disabled={submitting} on:click={submitGrades}>
            {#if submitting}<span class="spinner"></span> Submitting…{:else}Submit All Grades{/if}
          </button>
        {/if}
      {/if}
    {/if}
  </div>
</DashboardLayout>

<style>
  .section-title { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.85rem; }
  .course-card { background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 1.25rem; text-align: left; cursor: pointer; transition: all var(--transition); }
  .course-card:hover:not(:disabled) { border-color: var(--accent); background: var(--accent-dim); }
  .course-card:disabled { opacity: 0.45; cursor: not-allowed; }
  .course-id { font-size: 0.8rem; font-weight: 700; color: var(--accent); margin-bottom: 0.3rem; }
  .course-title { font-size: 0.875rem; font-weight: 500; }
  .grade-select { width: 100px; padding: 0.35rem 0.6rem; }
  .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }
</style>
