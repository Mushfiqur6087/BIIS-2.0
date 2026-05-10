<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { student } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let form = { Phone1: '', Phone2: '', Email: '', BankNP: '', Address: '', DOB: '', NID: '' };
  let loading = true, saving = false, success = false, error = '';

  onMount(async () => {
    try {
      const info = await student.updateInfo({});  // GET via separate endpoint
      // Actually GET profile via dashboard
      const data = await student.dashboard();
      const si = data.studentInfo;
      form = {
        Phone1: si.phoneNo || '', Phone2: si.phoneNo2 || '',
        Email: si.email || '', BankNP: si.bankNo || '',
        Address: si.address || '', DOB: si.dateOfBirth || '', NID: si.nid || '',
      };
    } catch (e) { error = e.message; }
    finally { loading = false; }
  });

  async function save(e) {
    e.preventDefault();
    saving = true; error = ''; success = false;
    try {
      await student.updateInfo(form);
      success = true;
    } catch (err) { error = err.message; }
    finally { saving = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Update Profile</title></svelte:head>

<DashboardLayout role="student" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Update Profile</h1>
      <p>Keep your contact information up to date</p>
    </div>

    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span><span class="text-muted text-sm">Loading…</span></div>
    {:else}
      <div class="form-card card">
        {#if success}<div class="alert alert-success mb-4">✓ Profile updated!</div>{/if}
        {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}

        <form on:submit={save}>
          <div class="grid-2">
            <div class="form-group">
              <label for="p1">Phone 1</label>
              <input id="p1" type="tel" bind:value={form.Phone1} placeholder="+880…" />
            </div>
            <div class="form-group">
              <label for="p2">Phone 2</label>
              <input id="p2" type="tel" bind:value={form.Phone2} placeholder="+880…" />
            </div>
            <div class="form-group">
              <label for="em">Email</label>
              <input id="em" type="email" bind:value={form.Email} />
            </div>
            <div class="form-group">
              <label for="bank">Bank Account No.</label>
              <input id="bank" bind:value={form.BankNP} />
            </div>
            <div class="form-group">
              <label for="dob">Date of Birth</label>
              <input id="dob" type="date" bind:value={form.DOB} />
            </div>
            <div class="form-group">
              <label for="nid">National ID</label>
              <input id="nid" bind:value={form.NID} />
            </div>
          </div>
          <div class="form-group">
            <label for="addr">Address</label>
            <textarea id="addr" bind:value={form.Address} rows="2"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" disabled={saving}>
            {#if saving}<span class="spinner"></span> Saving…{:else}Save Changes{/if}
          </button>
        </form>
      </div>
    {/if}
  </div>
</DashboardLayout>

<style>.form-card { max-width: 680px; }</style>
