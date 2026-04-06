import { createRouter, createWebHistory } from "vue-router";
import axios from 'axios';

// --- Views ---
import Home from '../views/opened/landing/Home.vue'
import Login from '../views/opened/auth/login.vue'
import ResetPassword from '../views/opened/auth/ResetPassword.vue'
import ForgotPasssword from '../views/opened/auth/forgotPassword.vue'
import ActivateEmailMessage from '../views/opened/landing/activateEmailMessage.vue'
import Registration from '../views/opened/auth/login.vue'
import Reset from '../views/opened/auth/reset.vue';
import AccessDenied from "../views/opened/auth/accessDenied.vue";
import dashboard from "../views/closed/dashboard.vue"
import first_dash from "../views/closed/first_dash.vue"

const routes = [
  {
    path: "/", 
    name: "home",
    component: Home,
    meta: { requiresGuest: true }
  },
  {
    path: "/login", 
    name: "login",
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: "/register", 
    name: "register",
    component: Registration,
    meta: { requiresGuest: true }
  },
  {
    path: "/email-activate-message", 
    name: "email-activate-message",
    component: ActivateEmailMessage,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasssword,
  },
  {
    path: "/:lang/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
    props: true,
  },
  {
    path: "/dashboard", 
    name: "dashboard",
    component: dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: "users",
        name: "Users-view",
        component: () => import('../views/closed/Users/UsersView.vue'),
      },
      {
        path: "users/add",
        name: "Users-add",
        component: () => import('../views/closed/Users/AddUsers.vue'),
      },
      {
        path: "users/edit/:id",
        name: "Users-edit",
        component: () => import('../views/closed/Users/EditUsers.vue'),
        props: true,
      },
      {
        path: "users/detail/:id",
        name: "Users-detail",
        component: () => import('../views/closed/Users/UsersDetail.vue'),
        props: true,
      },
      {
        path: "first-dash", 
        name: "first-dash",
        component: first_dash,
      },
    ]
  },
  { path: "/reset/:token", name: "reset", component: Reset, meta: { requiresGuest: true } },
  { path: "/:pathMatch(.*)*", name: "accessDenied", component: AccessDenied },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Helper to check authentication status with the Backend
 * This replaces the insecure localStorage.getItem("access")
 */
async function checkServerAuth() {
  try {
    const baseURL = import.meta.env.VITE_APP_BASE_URL_LOCAL;
    // We call the verify endpoint. If the HttpOnly cookie is valid, it returns 200.
    const response = await axios.get(`${baseURL}/auth/verify`, {
      withCredentials: true 
    });
    return { authenticated: true, user: response.data.user };
  } catch (error) {
    return { authenticated: false };
  }
}

// ✅ ASYNC ROUTER GUARD
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  // Check with server (This is the most secure way)
  const authStatus = await checkServerAuth();

  if (requiresAuth) {
    if (!authStatus.authenticated) {
      // User is NOT authenticated, redirect to login
      next({ name: "login" });
    } else {
      // User IS authenticated, proceed to the dashboard
      next();
    }
  } else if (requiresGuest) {
    if (authStatus.authenticated) {
      // User is already logged in, skip the login page and go to dashboard
      next({ name: "first-dash" });
    } else {
      // User is a guest and not logged in, proceed
      next();
    }
  } else {
    // Public routes
    next();
  }
});

export default router;