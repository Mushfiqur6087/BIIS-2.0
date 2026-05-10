<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
</script>

<svelte:head>
  <title>BIIS 2.0 — {$page.status === 404 ? 'Page Not Found' : 'Error'}</title>
</svelte:head>

<div class="error-root">
  <div class="error-card">
    <div class="code">{$page.status}</div>
    <div class="divider"></div>
    <div class="message">
      {#if $page.status === 404}
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
      {:else if $page.status === 403}
        <h1>Access Denied</h1>
        <p>You don't have permission to view this page.</p>
      {:else}
        <h1>Something Went Wrong</h1>
        <p>{$page.error?.message || 'An unexpected error occurred.'}</p>
      {/if}
    </div>
    <div class="actions">
      <button class="btn-back" on:click={() => history.back()}>← Go Back</button>
      <button class="btn-home" on:click={() => goto('/')}>Go to Login</button>
    </div>
  </div>
</div>

<style>
  :global(body) { margin: 0; }

  .error-root {
    min-height: 100vh;
    background: radial-gradient(ellipse at 20% 50%, #1a0533 0%, #0a0f1e 60%);
    display: flex; align-items: center; justify-content: center;
    padding: 2rem;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .error-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 3rem 4rem;
    text-align: center;
    backdrop-filter: blur(20px);
    box-shadow: 0 32px 64px rgba(0,0,0,0.5);
    max-width: 520px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }

  .code {
    font-size: 6rem;
    font-weight: 900;
    line-height: 1;
    background: linear-gradient(135deg, #7c3aed, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .divider {
    width: 60px; height: 2px;
    background: linear-gradient(90deg, #7c3aed, #06b6d4);
    border-radius: 2px;
  }

  .message h1 {
    font-size: 1.5rem; font-weight: 700;
    color: #fff; margin: 0 0 0.5rem;
  }
  .message p {
    color: rgba(255,255,255,0.5);
    font-size: 0.95rem; margin: 0;
    line-height: 1.6;
  }

  .actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }

  .btn-back, .btn-home {
    padding: 0.65rem 1.5rem;
    border-radius: 10px;
    font-size: 0.875rem; font-weight: 600;
    cursor: pointer; border: none;
    transition: all 0.2s;
  }
  .btn-back {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.7);
  }
  .btn-back:hover { background: rgba(255,255,255,0.12); color: #fff; }

  .btn-home {
    background: linear-gradient(135deg, #7c3aed, #5b21b6);
    color: #fff;
    box-shadow: 0 4px 16px rgba(124,58,237,0.4);
  }
  .btn-home:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.5); }
</style>
