<script>
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let form = { ID: '', PASSWORD: '', firstName: '', lastName: '', deptID: '' };
  let loading = false, success = false, error = '';
  const depts = ['CSE','EEE','BME','ME','CE','IPE','WRE','URP'];
  const ranks = ['Professor','Associate Professor','Assistant Professor','Lecturer'];

  async function handleSubmit(e) {
    e.preventDefault();
    loading = true; error = ''; success = false;
    try {
      await admin.addTeacher(form);
      success = true;
      setTimeout(() => goto('/admin/teachers'), 1500);
    } catch (err) {
      error = err.data?.error || err.message;
    } finally { loading = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Add Teacher</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header flex items-center gap-3">
      <a href="/admin/teachers" class="btn btn-ghost btn-sm">← Back</a>
      <div><h1>Add New Teacher</h1><p>Register a new faculty member</p></div>
    </div>

    <div class="form-card card">
      {#if success}<div class="alert alert-success mb-4">✓ Teacher added! Redirecting…</div>{/if}
      {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}

      <form on:submit={handleSubmit}>
        <div class="grid-2">
          <div class="form-group">
            <label for="tid">Teacher ID</label>
            <input id="tid" type="number" bind:value={form.ID} placeholder="e.g. 7200" required />
          </div>
          <div class="form-group">
            <label for="tpwd">Initial Password</label>
            <input id="tpwd" type="password" bind:value={form.PASSWORD} required minlength="8" />
          </div>
          <div class="form-group">
            <label for="tfirst">First Name</label>
            <input id="tfirst" bind:value={form.firstName} required />
          </div>
          <div class="form-group">
            <label for="tlast">Last Name</label>
            <input id="tlast" bind:value={form.lastName} required />
          </div>
          <div class="form-group">
            <label for="tdept">Department</label>
            <select id="tdept" bind:value={form.deptID} required>
              <option value="">Select department…</option>
              {#each depts as d}<option value={d}>{d}</option>{/each}
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary mt-4" disabled={loading}>
          {#if loading}<span class="spinner"></span> Adding…{:else}Add Teacher{/if}
        </button>
      </form>
    </div>
  </div>
</DashboardLayout>

<style>.form-card { max-width: 680px; }</style>
