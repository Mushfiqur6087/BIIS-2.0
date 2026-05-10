<script>
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let form = { teacherID: '', courseID: '' };
  let loading = false, success = false, error = '';

  async function handleSubmit(e) {
    e.preventDefault();
    loading = true; error = ''; success = false;
    try {
      await admin.assignTeacher(form);
      success = true;
      form = { teacherID: '', courseID: '' };
    } catch (err) {
      error = err.data?.error || err.message;
    } finally { loading = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Assign Teachers</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Assign Teachers to Courses</h1>
      <p>Link a faculty member to a course they will teach</p>
    </div>

    <div class="form-card card">
      {#if success}
        <div class="alert alert-success mb-4">✓ Teacher assigned to course successfully!</div>
      {/if}
      {#if error}
        <div class="alert alert-error mb-4">{error}</div>
      {/if}

      <form on:submit={handleSubmit}>
        <div class="form-group">
          <label for="teacher-id">Teacher ID</label>
          <input
            id="teacher-id"
            type="number"
            bind:value={form.teacherID}
            placeholder="e.g. 7001"
            required
          />
          <p class="hint">Must be a registered teacher in the system</p>
        </div>

        <div class="form-group">
          <label for="course-id">Course ID</label>
          <input
            id="course-id"
            bind:value={form.courseID}
            placeholder="e.g. CSE 101"
            required
          />
          <p class="hint">Teacher and course must belong to the same department</p>
        </div>

        <div class="info-box mb-4">
          <p class="text-sm">
            ℹ To add a new course first, go to <a href="/admin/courses" class="text-accent">Course Management</a>.
            To bulk-assign via CSV, use the CSV upload from the backend directly.
          </p>
        </div>

        <button type="submit" class="btn btn-primary" disabled={loading}>
          {#if loading}<span class="spinner"></span> Assigning…{:else}🔗 Assign Teacher{/if}
        </button>
      </form>
    </div>
  </div>
</DashboardLayout>

<style>
  .form-card { max-width: 520px; }
  .hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem; }
  .info-box { background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); border-radius: var(--radius-sm); padding: 0.85rem; color: var(--text-secondary); }
</style>
