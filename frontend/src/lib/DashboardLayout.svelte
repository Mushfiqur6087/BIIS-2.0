<script>
  export let role = 'admin';  // 'admin' | 'student' | 'teacher'
  export let userID = '';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { logout } from '$lib/stores/auth.js';

  const navItems = {
    admin: [
      { href: '/admin',                    icon: '◈', label: 'Dashboard' },
      { href: '/admin/students',           icon: '🎓', label: 'Students' },
      { href: '/admin/teachers',           icon: '👨‍🏫', label: 'Teachers' },
      { href: '/admin/courses',            icon: '📚', label: 'Courses' },
      { href: '/admin/assign',             icon: '🔗', label: 'Assign Teachers' },
      { href: '/admin/dues',               icon: '💳', label: 'Dues' },
      { href: '/admin/scholarships',       icon: '🏆', label: 'Scholarships' },
      { href: '/admin/registration',       icon: '📝', label: 'Registration' },
      { href: '/admin/promote',            icon: '⬆️', label: 'Promote Students' },
      { href: '/admin/notifications',      icon: '🔔', label: 'Notifications' },
    ],
    student: [
      { href: '/student',                  icon: '◈', label: 'Dashboard' },
      { href: '/student/courses',          icon: '📚', label: 'Courses' },
      { href: '/student/results',          icon: '📊', label: 'Results' },
      { href: '/student/dues',             icon: '💳', label: 'Dues' },
      { href: '/student/advisor',          icon: '👨‍🏫', label: 'My Advisor' },
      { href: '/student/scholarship',      icon: '🏆', label: 'Scholarship' },
      { href: '/student/profile',          icon: '👤', label: 'Update Profile' },
      { href: '/student/notifications',    icon: '🔔', label: 'Notifications' },
    ],
    teacher: [
      { href: '/teacher',                  icon: '◈', label: 'Dashboard' },
      { href: '/teacher/courses',          icon: '📚', label: 'Approve Courses' },
      { href: '/teacher/grades',           icon: '📝', label: 'Assign Grades' },
      { href: '/teacher/scholarship',      icon: '🏆', label: 'Scholarship' },
      { href: '/teacher/profile',          icon: '👤', label: 'Update Profile' },
      { href: '/teacher/notifications',    icon: '🔔', label: 'Notifications' },
    ],
  };

  const accentMap = { admin: '#7c3aed', student: '#0ea5e9', teacher: '#10b981' };
  const labelMap  = { admin: 'Admin', student: 'Student', teacher: 'Teacher' };

  async function handleLogout() {
    await logout();
    goto('/');
  }
</script>

<div class="layout" style="--accent:{accentMap[role]}; --accent-dim:{accentMap[role]}26; --accent-glow:{accentMap[role]}66;">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="logo-mark">{role[0].toUpperCase()}</div>
      <div>
        <div class="logo-title">BIIS <span>2.0</span></div>
        <div class="role-badge">{labelMap[role]} Portal</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      {#each navItems[role] as item}
        <a
          href={item.href}
          class="nav-item"
          class:active={$page.url.pathname === item.href}
        >
          <span class="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="avatar">{userID}</div>
        <div>
          <div class="user-id">ID: {userID}</div>
          <div class="user-role">{labelMap[role]}</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm w-full mt-3" on:click={handleLogout}>
        Sign Out
      </button>
    </div>
  </aside>

  <!-- Main content -->
  <main class="main-content">
    <slot />
  </main>
</div>

<style>
  .layout {
    display: flex; min-height: 100vh;
    background: var(--bg-deep);
  }

  /* ── Sidebar ───────────────────────────────────── */
  .sidebar {
    width: var(--sidebar-w); flex-shrink: 0;
    background: rgba(13,19,39,0.95);
    border-right: 1px solid var(--glass-border);
    backdrop-filter: blur(20px);
    display: flex; flex-direction: column;
    padding: 1.5rem 0;
    position: sticky; top: 0; height: 100vh;
    overflow-y: auto;
  }
  .sidebar-brand {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0 1.25rem 1.5rem;
    border-bottom: 1px solid var(--glass-border);
    margin-bottom: 0.75rem;
  }
  .logo-mark {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--accent), rgba(255,255,255,0.3));
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; font-weight: 800; color: #fff;
    box-shadow: 0 0 16px var(--accent-glow); flex-shrink: 0;
  }
  .logo-title { font-size: 0.95rem; font-weight: 700; line-height: 1.2; }
  .logo-title span { color: var(--accent); }
  .role-badge { font-size: 0.65rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

  .sidebar-nav { flex: 1; padding: 0 0.75rem; display: flex; flex-direction: column; gap: 0.15rem; }
  .nav-item {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.6rem 0.75rem; border-radius: var(--radius-sm);
    font-size: 0.85rem; color: var(--text-secondary);
    text-decoration: none;
    transition: all var(--transition);
  }
  .nav-item:hover  { background: var(--glass-hover); color: var(--text-primary); }
  .nav-item.active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }
  .nav-icon { font-size: 1rem; width: 20px; text-align: center; }

  .sidebar-footer {
    padding: 1rem 1.25rem 0;
    border-top: 1px solid var(--glass-border);
    margin-top: auto;
  }
  .user-info { display: flex; align-items: center; gap: 0.75rem; }
  .avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--accent-dim); border: 1px solid var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700; color: var(--accent); flex-shrink: 0;
  }
  .user-id   { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
  .user-role { font-size: 0.7rem; color: var(--text-muted); }

  /* ── Main ──────────────────────────────────────── */
  .main-content {
    flex: 1; min-width: 0;
    padding: 2rem;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .sidebar { display: none; }
  }
</style>
