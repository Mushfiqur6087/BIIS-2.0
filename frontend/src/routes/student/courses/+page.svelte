<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { student } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let data = null, loading = true, error = '';
  let selected = [], enrolling = false, enrollSuccess = false;

  onMount(async () => {
    try { data = await student.courses(); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });

  function toggleCourse(id) {
    if (selected.includes(id)) selected = selected.filter(c => c !== id);
    else selected = [...selected, id];
  }

  async function enroll() {
    if (!selected.length) return;
    enrolling = true;
    try {
      await student.enroll(selected);
      enrollSuccess = true;
      const d = await student.courses();
      data = d; selected = [];
    } catch (e) { error = e.message; }
    finally { enrolling = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — My Courses</title></svelte:head>

<DashboardLayout role="student" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Course Registration</h1>
      <p>Select and enrol in courses for your current semester</p>
    </div>

    {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}
    {#if enrollSuccess}<div class="alert alert-success mb-4">✓ Enrolled successfully!</div>{/if}

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else if !data?.registrationOpen}
      <div class="closed-state">
        <span class="closed-icon">🔒</span>
        <h2>Registration Closed</h2>
        <p class="text-muted">Course registration is currently closed. Check back when admin opens it.</p>
      </div>
    {:else}
      <!-- Approved courses (already enrolled) -->
      {#if data.approvedCourses?.length}
        <h2 class="section-title mb-3">Approved Enrollments</h2>
        <div class="course-grid mb-6">
          {#each data.approvedCourses as c}
            <div class="course-card approved">
              <div class="course-id">{c.COURSE_ID}</div>
              <div class="course-title">{c.COURSE_TITLE}</div>
              <div class="course-meta">{c.CREDIT} credits · <span class="badge badge-success">Approved</span></div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Available courses to enroll -->
      {#if data.courses?.length}
        <h2 class="section-title mb-3">Available Courses</h2>
        <div class="course-grid">
          {#each data.courses as c}
            {@const isSelected = selected.includes(c.COURSE_ID)}
            <button class="course-card selectable" class:active={isSelected} on:click={() => toggleCourse(c.COURSE_ID)}>
              <div class="select-check">{isSelected ? '✓' : ''}</div>
              <div class="course-id">{c.COURSE_ID}</div>
              <div class="course-title">{c.COURSE_TITLE}</div>
              <div class="course-meta">{c.CREDIT} credits</div>
            </button>
          {/each}
        </div>

        {#if selected.length}
          <div class="enroll-bar">
            <span class="text-sm">{selected.length} course(s) selected</span>
            <button class="btn btn-primary" disabled={enrolling} on:click={enroll}>
              {#if enrolling}<span class="spinner"></span> Enrolling…{:else}Confirm Enrollment{/if}
            </button>
          </div>
        {/if}
      {:else if !data.approvedCourses?.length}
        <div class="empty-state">No available courses found for your current level/term.</div>
      {/if}
    {/if}
  </div>
</DashboardLayout>

<style>
  .section-title { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.85rem; }
  .course-card { background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 1.1rem; text-align: left; position: relative; }
  .course-card.approved { border-color: rgba(34,197,94,0.3); }
  .course-card.selectable { cursor: pointer; transition: all var(--transition); }
  .course-card.selectable:hover { border-color: var(--accent); }
  .course-card.active { border-color: var(--accent); background: var(--accent-dim); }
  .select-check { position: absolute; top: 0.75rem; right: 0.75rem; width: 20px; height: 20px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 0.65rem; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity var(--transition); }
  .course-card.active .select-check { opacity: 1; }
  .course-id { font-size: 0.78rem; font-weight: 700; color: var(--accent); margin-bottom: 0.3rem; }
  .course-title { font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; }
  .course-meta { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; }
  .enroll-bar { position: sticky; bottom: 1rem; background: var(--bg-surface); border: 1px solid var(--accent); border-radius: var(--radius-md); padding: 1rem 1.5rem; margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
  .closed-state, .empty-state { text-align: center; padding: 4rem 2rem; }
  .closed-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
</style>
