<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { teacher } from '$lib/api/index.js';
  import DashboardLayout from '$lib/DashboardLayout.svelte';

  let form = { Phone1: '', Phone2: '', Email: '', Address: '' };
  let loading = true, saving = false, success = false, error = '';

  onMount(async () => {
    try {
      const data = await teacher.dashboard();
      const ti = data.teacherInfo;
      form = { Phone1: ti.phoneNo||'', Phone2: ti.phoneNo2||'', Email: ti.email||'', Address: ti.address||'' };
    } catch (e) { error = e.message; }
    finally { loading = false; }
  });

  async function save(e) {
    e.preventDefault();
    saving = true; success = false; error = '';
    try {
      await teacher.updateInfo(form);
      success = true;
    } catch (err) { error = err.message; }
    finally { saving = false; }
  }
</script>

<svelte:head><title>BIIS 2.0 — Update Profile</title></svelte:head>

<DashboardLayout role="teacher" userID={$user?.userID || ''}>
  <div class="fade-in">
    <div class="page-header">
      <h1>Update Profile</h1>
      <p>Manage your contact details</p>
    </div>
    {#if loading}
      <div class="flex items-center gap-3"><span class="spinner"></span></div>
    {:else}
      <div class="form-card card">
        {#if success}<div class="alert alert-success mb-4">✓ Profile updated!</div>{/if}
        {#if error}<div class="alert alert-error mb-4">{error}</div>{/if}
        <form on:submit={save}>
          <div class="grid-2">
            <div class="form-group"><label for="tp1">Phone 1</label><input id="tp1" type="tel" bind:value={form.Phone1} /></div>
            <div class="form-group"><label for="tp2">Phone 2</label><input id="tp2" type="tel" bind:value={form.Phone2} /></div>
            <div class="form-group"><label for="tem">Email</label><input id="tem" type="email" bind:value={form.Email} /></div>
          </div>
          <div class="form-group"><label for="taddr">Address</label><textarea id="taddr" bind:value={form.Address} rows="2"></textarea></div>
          <button type="submit" class="btn btn-primary" disabled={saving}>
            {#if saving}<span class="spinner"></span> Saving…{:else}Save Changes{/if}
          </button>
        </form>
      </div>
    {/if}
  </div>
</DashboardLayout>

<style>.form-card { max-width: 580px; }</style>
