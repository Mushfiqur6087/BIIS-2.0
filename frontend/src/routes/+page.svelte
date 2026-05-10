<script>
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth.js';
  import { auth } from '$lib/api/index.js';

  let username = '';
  let password = '';
  let loading  = false;
  let error    = '';

  async function handleLogin(e) {
    e.preventDefault();
    error   = '';
    loading = true;
    try {
      const data = await auth.login(username, password);
      user.set(data);
      if (data.role === 'admin')        goto('/admin');
      else if (data.role === 'student') goto('/student');
      else                              goto('/teacher');
    } catch (err) {
      error = err.message || 'Login failed. Please check your credentials.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>BIIS 2.0 — Login</title>
</svelte:head>

<div class="login-root">
  <!-- Animated background orbs -->
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <div class="login-container fade-in">
    <!-- Logo / brand -->
    <div class="brand">
      <div class="logo-mark">
        <span>B</span>
      </div>
      <div>
        <h1>BIIS <span class="version">2.0</span></h1>
        <p>Buet Institute Information System</p>
      </div>
    </div>

    <div class="divider"></div>

    <h2>Welcome back</h2>
    <p class="subtitle">Sign in to your account to continue</p>

    {#if error}
      <div class="alert alert-error mt-4">{error}</div>
    {/if}

    <form on:submit={handleLogin} class="mt-6">
      <div class="form-group">
        <label for="username">User ID</label>
        <input
          id="username" type="text"
          bind:value={username}
          placeholder="e.g. 2000 (admin) · 8001 (student)"
          autocomplete="username" required
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password" type="password"
          bind:value={password}
          placeholder="••••••••"
          autocomplete="current-password" required
        />
      </div>

      <button type="submit" class="btn btn-primary w-full mt-2" disabled={loading}>
        {#if loading}
          <span class="spinner"></span> Signing in…
        {:else}
          Sign In
        {/if}
      </button>
    </form>

    <div class="roles mt-6">
      <span class="role-pill admin">Admin</span>
      <span class="role-pill student">Student</span>
      <span class="role-pill teacher">Teacher</span>
    </div>
    <p class="hint">Default password: <code>12345678</code></p>
  </div>
</div>

<style>
  .login-root {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg-deep);
    position: relative; overflow: hidden;
  }

  /* Glowing background orbs */
  .orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: 0.18; pointer-events: none;
    animation: float 8s ease-in-out infinite;
  }
  .orb-1 { width: 500px; height: 500px; background: #7c3aed; top: -200px; right: -100px; animation-delay: 0s; }
  .orb-2 { width: 400px; height: 400px; background: #0ea5e9; bottom: -150px; left: -120px; animation-delay: 3s; }
  .orb-3 { width: 300px; height: 300px; background: #10b981; top: 50%; left: 50%; transform: translate(-50%,-50%); animation-delay: 6s; }
  @keyframes float {
    0%, 100% { transform: translateY(0) scale(1); }
    50%       { transform: translateY(-20px) scale(1.03); }
  }
  .orb-3 { animation: float2 10s ease-in-out infinite; }
  @keyframes float2 {
    0%, 100% { transform: translate(-50%,-50%) scale(1); }
    50%       { transform: translate(-50%,-50%) scale(1.1); }
  }

  .login-container {
    position: relative; z-index: 1;
    background: rgba(17, 24, 39, 0.75);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 2.5rem;
    width: min(420px, calc(100vw - 2rem));
    box-shadow: 0 8px 64px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.08) inset;
  }

  .brand {
    display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;
  }
  .logo-mark {
    width: 48px; height: 48px; border-radius: 14px;
    background: linear-gradient(135deg, #7c3aed, #0ea5e9);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; font-weight: 800; color: #fff;
    box-shadow: 0 0 24px rgba(124,58,237,0.5);
    flex-shrink: 0;
  }
  .brand h1 { font-size: 1.35rem; font-weight: 800; line-height: 1.2; }
  .version { background: linear-gradient(90deg,#7c3aed,#0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .brand p { font-size: 0.72rem; color: var(--text-secondary); }

  .divider { height: 1px; background: var(--glass-border); margin-bottom: 1.5rem; }

  h2 { font-size: 1.25rem; font-weight: 700; }
  .subtitle { color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem; }

  .roles { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .role-pill {
    padding: 0.3rem 0.8rem; border-radius: 99px;
    font-size: 0.72rem; font-weight: 600;
  }
  .role-pill.admin   { background: rgba(124,58,237,0.15); color: #a78bfa; }
  .role-pill.student { background: rgba(14,165,233,0.15); color: #38bdf8; }
  .role-pill.teacher { background: rgba(16,185,129,0.15); color: #34d399; }

  .hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.6rem; }
  code { background: rgba(255,255,255,0.08); padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace; color: var(--text-secondary); }
</style>
