<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { teacher } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let data = null, loading = true, error = '';
  let selected = [], submitting = false, success = false;

  onMount(async () => {
    try { data = await teacher.approvableCourses(); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  });

  function toggle(id) {
    if (selected.includes(id)) selected = selected.filter(c => c !== id);
    else selected = [...selected, id];
  }

  async function approve() {
    submitting = true;
    try {
      await teacher.approveCourses(selected);
      success = true;
      const d = await teacher.approvableCourses();
      data = d; selected = [];
    } catch (e) { error = e.message; }
    finally { submitting = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Approve Courses</title></svelte:head>

<DashboardLayout role="teacher" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Course Approvals</h1>
      <p>Review and approve student course enrollment requests</p>
    </div>

    {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}
    {#if success}<div class="alert alert-success mb-4">✓ Courses approved!</div>{/if}

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else if !data?.courses?.length}
      <div class="empty-state">
        <span style="font-size:3rem;">✅</span>
        <h3 class="mt-4">No pending approvals</h3>
        <p class="text-muted text-sm">All student enrollments are up to date.</p>
      </div>
    {:else}
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="width:40px"><input type="checkbox" on:change={e => selected = e.target.checked ? data.courses.map(c => c.ENROLLMENT_ID) : []} /></th>
                <th>Student ID</th><th>Course ID</th><th>Course Title</th><th>Level/Term</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {#each data.courses as c}
                {@const isSelected = selected.includes(c.ENROLLMENT_ID)}
                <tr class:selected={isSelected} on:click={() => toggle(c.ENROLLMENT_ID)}>
                  <td><input type="checkbox" checked={isSelected} on:change={() => toggle(c.ENROLLMENT_ID)} on:click|stopPropagation /></td>
                  <td><span class="badge badge-accent">{c.STUDENT_ID}</span></td>
                  <td>{c.COURSE_ID}</td>
                  <td>{c.COURSE_TITLE ?? '—'}</td>
                  <td>L{c.LEVEL}/T{c.TERM}</td>
                  <td><span class="badge badge-warning">{c.STATUS ?? 'Pending'}</span></td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      {#if selected.length}
        <div class="action-bar">
          <span class="text-sm">{selected.length} selected</span>
          <button class="btn btn-primary" disabled={submitting} on:click={approve}>
            {#if submitting}<span class="spinner"></span>{:else}✓ Approve Selected{/if}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</DashboardLayout>

<style>
  tbody tr { cursor: pointer; }
  tbody tr.selected { background: var(--accent-dim) !important; }
  .action-bar { position: sticky; bottom: 1rem; background: var(--bg-surface); border: 1px solid var(--accent); border-radius: var(--radius-md); padding: 1rem 1.5rem; margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
  .empty-state { text-align: center; padding: 4rem 2rem; }
</style>
