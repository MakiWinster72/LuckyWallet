import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { filterAdminUsers } from "../api/admin-user-adapter";
import {
  createAdminUserApi,
  listAdminUsersApi,
  updateAdminUserApi,
} from "../api/admin-users";
import { AppIcon } from "./AppIcon";
import { UserAvatar } from "./UserAvatar";

const EMPTY_FILTERS = { query: "", role: "all", status: "all" };
const EMPTY_NEW_USER = {
  username: "",
  nickname: "",
  password: "",
  role: "user",
};
const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("userRole");
  const status = params.get("userStatus");
  return {
    query: params.get("userQuery") ?? "",
    role: role === "admin" || role === "user" ? role : "all",
    status: status === "active" || status === "inactive" ? status : "all",
  };
}

function displayName(user) {
  return user.nickname || user.username;
}

function CreateUserDialog({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_NEW_USER);
  const [status, setStatus] = useState({ saving: false, error: "" });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (form.username.trim().length < 3 || form.password.length < 8) {
      setStatus({ saving: false, error: "用户名至少 3 个字符，密码至少 8 个字符。" });
      return;
    }
    setStatus({ saving: true, error: "" });
    try {
      const user = await createAdminUserApi(form);
      onCreated(user);
    } catch (error) {
      setStatus({ saving: false, error: `${error.message} 请检查用户名是否重复后重试。` });
    }
  }

  return (
    <div className="dialog-backdrop">
      <section className="admin-user-dialog" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
        <header>
          <div>
            <span className="overline">NEW ACCOUNT</span>
            <h2 id="create-user-title">新增用户</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭新增用户窗口">
            <AppIcon name="close" />
          </button>
        </header>
        <form onSubmit={submit}>
          <label>
            用户名
            <input name="username" autoComplete="off" spellCheck={false} minLength="3" required
              value={form.username} onChange={(event) => update("username", event.target.value)}
              placeholder="例如：xiaoyu…" />
          </label>
          <label>
            昵称
            <input name="nickname" autoComplete="off" value={form.nickname}
              onChange={(event) => update("nickname", event.target.value)}
              placeholder="例如：小雨…" />
          </label>
          <label>
            初始密码
            <input name="new-password" type="password" autoComplete="new-password" minLength="8" required
              value={form.password} onChange={(event) => update("password", event.target.value)}
              placeholder="至少 8 个字符…" />
          </label>
          <label>
            角色
            <select name="role" value={form.role} onChange={(event) => update("role", event.target.value)}>
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </label>
          <p className="form-hint">普通用户可以参与账单；管理员还可以管理用户与权限。</p>
          {status.error ? <p className="dialog-error" role="alert">{status.error}</p> : null}
          <footer>
            <button className="text-button" type="button" onClick={onClose}>取消</button>
            <button className="primary-button" type="submit" disabled={status.saving}>
              {status.saving ? "正在创建…" : "创建用户"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function EditUserDialog({ user, currentUserId, onClose, onUpdated }) {
  const [form, setForm] = useState(() => ({ ...user, password: "" }));
  const [status, setStatus] = useState({ saving: false, error: "" });
  const [isConfirming, setIsConfirming] = useState(false);
  const isSelf = user.id === currentUserId;
  const isSensitiveChange = form.role !== user.role || form.isActive !== user.isActive;

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.nickname.trim()) {
      setStatus({ saving: false, error: "请填写昵称，以便团队成员识别该用户。" });
      return;
    }
    if (form.password && form.password.length < 8) {
      setStatus({ saving: false, error: "新密码至少需要 8 个字符。" });
      return;
    }
    if (isSensitiveChange) {
      setIsConfirming(true);
      return;
    }
    void save();
  }

  async function save() {
    setStatus({ saving: true, error: "" });
    try {
      const updated = await updateAdminUserApi(form);
      onUpdated(updated);
    } catch (error) {
      setStatus({ saving: false, error: `${error.message} 请刷新用户列表后重试。` });
    }
  }

  return (
    <div className="dialog-backdrop">
      <section className="admin-user-dialog" role="dialog" aria-modal={isConfirming ? undefined : "true"}
        aria-hidden={isConfirming ? "true" : undefined} inert={isConfirming ? "" : undefined}
        aria-labelledby="edit-user-title">
        <header>
          <div>
            <span className="overline">ACCOUNT SETTINGS</span>
            <h2 id="edit-user-title">编辑 {displayName(user)}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭编辑用户窗口">
            <AppIcon name="close" />
          </button>
        </header>
        <form onSubmit={submit}>
          <label>
            用户名
            <input name="username" value={user.username} readOnly aria-describedby="username-readonly-hint" />
          </label>
          <small id="username-readonly-hint" className="form-hint">用户名创建后不可修改。</small>
          <label>
            昵称
            <input name="nickname" autoComplete="off" required value={form.nickname}
              onChange={(event) => update("nickname", event.target.value)}
              placeholder="例如：小雨…" />
          </label>
          <label>
            重置密码
            <input name="password" type="password" autoComplete="new-password" minLength="8"
              value={form.password} onChange={(event) => update("password", event.target.value)}
              placeholder="留空表示不修改，至少 8 个字符…" />
          </label>
          <label>
            角色
            <select name="role" value={form.role} disabled={isSelf}
              onChange={(event) => update("role", event.target.value)}>
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </label>
          <label className="status-toggle">
            <input name="is-active" type="checkbox" checked={form.isActive} disabled={isSelf}
              onChange={(event) => update("isActive", event.target.checked)} />
            <span><strong>允许登录</strong><small>停用后，该用户将无法继续访问 LuckyWallet。</small></span>
          </label>
          {isSelf ? <p className="form-hint">为避免锁定当前会话，不能修改自己的角色或登录状态。</p> : null}
          {isSensitiveChange ? <p className="safety-note" role="note">保存后将立即变更该用户的权限或登录状态，请确认操作对象无误。</p> : null}
          {status.error ? <p className="dialog-error" role="alert">{status.error}</p> : null}
          <footer>
            <button className="text-button" type="button" onClick={onClose}>取消</button>
            <button className="primary-button" type="submit" disabled={status.saving}>
              {status.saving ? "正在保存…" : isSensitiveChange ? "确认并保存" : "保存修改"}
            </button>
          </footer>
        </form>
      </section>
      {isConfirming ? (
        <section className="confirm-dialog admin-change-confirm" role="alertdialog" aria-modal="true"
          aria-labelledby="confirm-user-change-title" aria-describedby="confirm-user-change-copy">
          <span className="confirm-icon" aria-hidden="true">!</span>
          <h2 id="confirm-user-change-title">确认修改 {displayName(user)}？</h2>
          <p id="confirm-user-change-copy">
            {form.isActive ? "角色变更会立即影响该用户可访问的功能。" : "停用后，该用户将无法登录或继续使用 LuckyWallet。"}
          </p>
          <footer>
            <button className="text-button" type="button" onClick={() => setIsConfirming(false)}>返回检查</button>
            <button className="delete-button" type="button" disabled={status.saving} onClick={() => void save()}>
              {status.saving ? "正在保存…" : "确认修改"}
            </button>
          </footer>
        </section>
      ) : null}
    </div>
  );
}

export function AdminUsersView({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(readFiltersFromUrl);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const deferredQuery = useDeferredValue(filters.query);

  async function loadUsers() {
    setStatus({ loading: true, error: "" });
    try {
      setUsers(await listAdminUsersApi());
      setStatus({ loading: false, error: "" });
    } catch (error) {
      setStatus({ loading: false, error: `${error.message} 请确认当前账号仍有管理员权限。` });
    }
  }

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const result = await listAdminUsersApi();
        if (!ignore) {
          setUsers(result);
          setStatus({ loading: false, error: "" });
        }
      } catch (error) {
        if (!ignore) setStatus({ loading: false, error: `${error.message} 请确认当前账号仍有管理员权限。` });
      }
    }
    void load();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const values = {
      userQuery: filters.query,
      userRole: filters.role === "all" ? "" : filters.role,
      userStatus: filters.status === "all" ? "" : filters.status,
    };
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }, [filters]);

  const visibleUsers = useMemo(() => filterAdminUsers(users, {
    ...filters,
    query: deferredQuery,
  }), [users, filters, deferredQuery]);
  const adminCount = users.reduce((count, user) => count + Number(user.role === "admin"), 0);
  const activeCount = users.reduce((count, user) => count + Number(user.isActive), 0);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function addUser(user) {
    setUsers((current) => [user, ...current]);
    setIsCreating(false);
  }

  function replaceUser(user) {
    setUsers((current) => current.map((item) => item.id === user.id ? user : item));
    setEditingUser(null);
  }

  return (
    <section className="admin-users-view" aria-labelledby="admin-users-title">
      <header className="admin-users-heading">
        <div>
          <span className="overline">ACCESS CONTROL</span>
          <h1 id="admin-users-title">用户管理</h1>
          <p>创建团队账号，并管理角色与登录权限。</p>
        </div>
        <button className="add-button" type="button" onClick={() => setIsCreating(true)}>
          <AppIcon name="userPlus" size={18} />新增用户
        </button>
      </header>

      <div className="admin-user-summary" aria-label="用户概况">
        <article><span>全部用户</span><strong>{users.length}</strong></article>
        <article><span>已启用</span><strong>{activeCount}</strong></article>
        <article><span>管理员</span><strong>{adminCount}</strong></article>
      </div>

      <div className="admin-user-toolbar">
        <label className="admin-user-search">
          <span>搜索用户</span>
          <div><AppIcon name="search" size={17} /><input name="user-search" type="search"
            autoComplete="off" spellCheck={false} value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder="搜索用户名或昵称…" /></div>
        </label>
        <label>
          角色
          <select name="user-role-filter" value={filters.role} onChange={(event) => updateFilter("role", event.target.value)}>
            <option value="all">全部角色</option>
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </label>
        <label>
          状态
          <select name="user-status-filter" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="all">全部状态</option>
            <option value="active">已启用</option>
            <option value="inactive">已停用</option>
          </select>
        </label>
        <button className="clear-filter" type="button" onClick={() => setFilters(EMPTY_FILTERS)}>清除筛选</button>
      </div>

      <section className="panel admin-user-register" aria-label="用户列表">
        {status.loading ? <div className="admin-user-state" role="status">正在加载用户…</div> : null}
        {status.error ? <div className="admin-user-state is-error" role="alert"><p>{status.error}</p><button type="button" onClick={loadUsers}>重新加载</button></div> : null}
        {!status.loading && !status.error && visibleUsers.length === 0 ? (
          <div className="admin-user-state"><h3>{users.length ? "没有匹配的用户" : "还没有团队用户"}</h3><p>{users.length ? "调整筛选条件，查看其他用户。" : "创建第一个普通用户，开始记录共同账单。"}</p></div>
        ) : null}
        {!status.loading && !status.error && visibleUsers.length ? (
          <div className="admin-user-table-scroll">
            <table>
              <thead><tr><th>用户</th><th>角色</th><th>状态</th><th>创建日期</th><th><span className="sr-only">操作</span></th></tr></thead>
              <tbody>{visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td><UserAvatar user={user} variant="admin" /><span><strong>{displayName(user)}</strong><small translate="no">@{user.username}</small></span></td>
                  <td data-label="角色"><span className={`role-pill is-${user.role}`}>{user.role === "admin" ? "管理员" : "普通用户"}</span></td>
                  <td data-label="状态"><span className={`account-status ${user.isActive ? "is-active" : "is-inactive"}`}><i aria-hidden="true" />{user.isActive ? "已启用" : "已停用"}</span></td>
                  <td data-label="创建日期">{user.createdAt ? dateFormatter.format(new Date(user.createdAt)) : "—"}</td>
                  <td className="admin-user-row-action"><button className="row-action" type="button" onClick={() => setEditingUser(user)} aria-label={`编辑${displayName(user)}`}><AppIcon name="edit" size={16} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : null}
      </section>

      {isCreating ? <CreateUserDialog onClose={() => setIsCreating(false)} onCreated={addUser} /> : null}
      {editingUser ? <EditUserDialog user={editingUser} currentUserId={currentUserId} onClose={() => setEditingUser(null)} onUpdated={replaceUser} /> : null}
    </section>
  );
}
