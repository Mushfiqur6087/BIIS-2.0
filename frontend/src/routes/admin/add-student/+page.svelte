<script>
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth.js';
  import { admin } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let form = { ID: '', PASSWORD: '', firstName: '', lastName: '', deptID: '', advisorID: '', hall: '' };
  let loading = false, success = false, error = '';

  const depts = ['CSE','EEE','BME','ME','CE','IPE','WRE','URP'];
  const halls = ['Ahsan Ullah Hall','Titumir Hall','Sher-e-Bangla Hall','Quaid-e-Azam Hall','Dr. M.A. Rashid Hall','Nazrul Islam Hall'];

  async function handleSubmit(e) {
    e.preventDefault();
    loading = true; error = ''; success = false;
    try {
      await admin.addStudent(form);
      success = true;
      setTimeout(() => goto('/admin/students'), 1500);
    } catch (err) {
      error = err.data?.error || err.message;
    } finally { loading = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Add Student</title></svelte:head>

<DashboardLayout role="admin" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header flex items-center gap-3">
      <a href="/admin/students" class="btn btn-ghost btn-sm">← Back</a>
      <div><h1>Add New Student</h1><p>Enrol a new student into the system</p></div>
    </div>

    <div class="form-card card">
      {#if success}<div class="alert alert-success mb-4">✓ Student added successfully! Redirecting…</div>{/if}
      {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}

      <form on:submit={handleSubmit}>
        <div class="grid-2">
          <div class="form-group">
            <label for="sid">Student ID</label>
            <input id="sid" type="number" bind:value={form.ID} placeholder="e.g. 8200" required />
          </div>
          <div class="form-group">
            <label for="spwd">Initial Password</label>
            <input id="spwd" type="password" bind:value={form.PASSWORD} placeholder="min 8 chars" required minlength="8" />
          </div>
          <div class="form-group">
            <label for="sfirst">First Name</label>
            <input id="sfirst" bind:value={form.firstName} required />
          </div>
          <div class="form-group">
            <label for="slast">Last Name</label>
            <input id="slast" bind:value={form.lastName} required />
          </div>
          <div class="form-group">
            <label for="sdept">Department</label>
            <select id="sdept" bind:value={form.deptID} required>
              <option value="">Select department…</option>
              {#each depts as d}<option value={d}>{d}</option>{/each}
            </select>
          </div>
          <div class="form-group">
            <label for="sadv">Advisor Teacher ID</label>
            <input id="sadv" type="number" bind:value={form.advisorID} placeholder="e.g. 7001" required />
          </div>
          <div class="form-group">
            <label for="shall">Hall</label>
            <select id="shall" bind:value={form.hall} required>
              <option value="">Select hall…</option>
              {#each halls as h}<option value={h}>{h}</option>{/each}
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary mt-4" disabled={loading}>
          {#if loading}<span class="spinner"></span> Adding…{:else}Add Student{/if}
        </button>
      </form>
    </div>
  </div>
</DashboardLayout>

<style>
  .form-card { max-width: 680px; }
</style>
