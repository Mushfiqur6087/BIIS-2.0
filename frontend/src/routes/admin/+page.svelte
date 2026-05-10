<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let data = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      data = await admin.dashboard();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  const deptNames = { CSE:'Comp. Science & Eng.', EEE:'Electrical & Electronic Eng.', BME:'Biomedical Eng.', ME:'Mechanical Eng.', CE:'Civil Eng.', IPE:'Industrial & Production Eng.', WRE:'Water Resources Eng.', URP:'Urban & Regional Planning' };
</script>

<svelte:head><title>BIIS 2.0 — Admin Dashboard</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Admin Dashboard</h1>
      <p>Overview of all departments, students and course enrollments</p>
    </div>

    {#if loading}
      <div class="flex items-center gap-3 mt-6">
        <span class="spinner"></span>
        <span class="text-muted text-sm">Loading dashboard data…</span>
      </div>
    {:else if error}
      <div class="alert alert-error">{error}</div>
    {:else if data}
      <!-- Department stats -->
      <h2 class="section-title">Department Overview</h2>
      <div class="grid-4 mb-6">
        {#each data.departments as dept}
          <div class="stat-card">
            <div class="label">{deptNames[dept.DEPT_NAME] || dept.DEPT_NAME}</div>
            <div class="value">{dept.TOTAL_STUDENTS ?? 0}</div>
            <div class="sub">👨‍🏫 {dept.TOTAL_TEACHERS ?? 0} teachers</div>
          </div>
        {/each}
      </div>

      <!-- Course enrollment table -->
      <h2 class="section-title">Course Enrollment Status</h2>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Course ID</th>
                <th>Max Enrollment</th>
                <th>Current</th>
                <th>Teachers</th>
                <th>Fill Rate</th>
              </tr>
            </thead>
            <tbody>
              {#each data.courses as course}
                {@const pct = course.MAX_ENROLLMENT > 0
                  ? Math.round((course.CURRENT_ENROLLMENT / course.MAX_ENROLLMENT) * 100) : 0}
                <tr>
                  <td>{course.DEPT_NAME}</td>
                  <td><span class="badge badge-accent">{course.COURSE_ID}</span></td>
                  <td>{course.MAX_ENROLLMENT}</td>
                  <td>{course.CURRENT_ENROLLMENT}</td>
                  <td>{course.TOTAL_TEACHER}</td>
                  <td>
                    <div class="fill-bar">
                      <div class="fill-inner" style="width:{pct}%"></div>
                    </div>
                    <span class="text-xs text-muted">{pct}%</span>
                  </td>
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
  .section-title { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.75rem; }
  .fill-bar { width: 80px; height: 6px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; margin-bottom: 2px; }
  .fill-inner { height: 100%; background: var(--accent); border-radius: 99px; transition: width 0.6s ease; }
</style>
