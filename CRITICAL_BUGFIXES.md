# Critical Bug Fixes - Capstone System

**Date:** April 25, 2026  
**Summary:** 10 critical security bugs, data leaks, and component errors have been fixed.

---

## 🔴 CRITICAL BUGS FIXED

### 1. **Login Rate Limit Counter Never Resets** ✅
- **File:** [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx#L196-L218)
- **Issue:** The `loginAttemptsRef` counter tracked failed logins but was never cleared after successful login. Users could be falsely rate-limited if they failed a few times, succeeded, logged out, and tried again within 2 minutes.
- **Fix:** Reset `loginAttemptsRef` to `{ count: 0, firstAttemptTime: Date.now() }` immediately after successful login.
- **Impact:** Prevents denial-of-service against legitimate users.

---

### 2. **Cross-Shop Data Leak via Empty shop_id** ✅
- **File:** [src/components/BrowsePartsModal.tsx](src/components/BrowsePartsModal.tsx#L51-L64)
- **Issue:** When `user?.shop_id` was undefined, it fell back to an empty string. The check `if (shopId)` treated empty string as falsy, skipping the shop_id filter entirely, potentially returning parts from all shops to unauthorized customers.
- **Fix:** Validate that `shopId` is a non-empty string before querying. Return empty array and log error if validation fails.
- **Impact:** Prevents unauthorized access to other shops' inventory data.

---

### 3. **Locale-Dependent Date Keys Cause Duplicate Chart Entries** ✅
- **File:** [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx#L150-L170)
- **Issue:** Used `.toLocaleDateString()` which returns locale-dependent strings ("Jan 1" vs "1/1" vs "Jan 01"). Same day could appear as different keys in revenue charts.
- **Fix:** Replaced all `.toLocaleDateString()` calls with `.toISOString().split('T')[0]` to produce consistent YYYY-MM-DD UTC dates.
- **Locations:**
  - Line 157: Appointment revenue by date
  - Line 160: Job order revenue by date
  - Line 163: POS sales revenue by date
- **Impact:** Ensures accurate revenue data aggregation regardless of user locale.

---

### 4. **Stale Closure in MechanicDashboard useEffect** ✅
- **File:** [src/pages/MechanicDashboard.tsx](src/pages/MechanicDashboard.tsx#L248)
- **Issue:** The `fetchAllData` function referenced `user?.id` and `user?.shop_id`, but the dependency array was `[user?.id]`. If the user object changed after re-authentication, stale functions ran with old data.
- **Fix:** Changed dependency array from `[user?.id]` to `[user]` to ensure the entire user object is tracked.
- **Impact:** Prevents stale data issues during re-authentication or user profile updates.

---

### 5. **JSON.parse Without try-catch in FeaturedSection** ✅
- **File:** [src/components/FeaturedSection.tsx](src/components/FeaturedSection.tsx#L100-L130)
- **Issue:** localStorage data was parsed without error handling. Corrupted or malformed data caused `SyntaxError` and crashed the component.
- **Fix:** Wrapped `JSON.parse()` in try-catch block. On parse error, clears corrupted localStorage and starts fresh.
- **Impact:** Improves app stability and handles edge cases gracefully.

---

### 6. **Missing Realtime Channel Cleanup** ✅
- **File:** [src/pages/AppointmentCalendarPage.tsx](src/pages/AppointmentCalendarPage.tsx#L87-L103)
- **Issue:** Supabase realtime channel was subscribed on mount, but cleanup function didn't call `channel.unsubscribe()`, leaking the subscription on unmount.
- **Fix:** Added `channel.unsubscribe()` before `supabase.removeChannel(channel)` in the useEffect cleanup function.
- **Impact:** Prevents memory leaks and resource exhaustion from accumulating subscriptions.

---

### 7. **Logout Does Not Clear Cached Data** ✅
- **File:** [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx#L224-L244)
- **Issue:** `logout()` set user to null but didn't clear localStorage keys used by PartsListContext and page state. Next user on same browser could see leftover data.
- **Fix:** Added comprehensive localStorage cleanup on logout:
  - Removes specific keys: `moto_last_page`, `motoshop_appointments`, `parts_list_*`
  - Clears all keys starting with `parts_list_` or `moto_` patterns
- **Impact:** Prevents multi-user data leaks in shared environments.

---

### 8. **Duplicate Type Definition** ✅
- **File:** [src/types/index.ts](src/types/index.ts#L114-L131)
- **Issue:** `FeaturedProduct` interface was defined twice identically, causing confusion and maintenance drift risks.
- **Fix:** Removed duplicate definition (kept first, removed second).
- **Impact:** Clean, maintainable type definitions.

---

### 9. **Missing Null Check for user.shop_id in Dashboard** ✅
- **File:** [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx#L32-L42)
- **Issue:** Dashboard queries used `user?.shop_id` without verification, causing silent query failures and misleading metrics.
- **Fix:** Added explicit guard at beginning of `fetchDashboardData`:
  ```typescript
  if (!user?.shop_id) {
    console.warn("Dashboard: User shop_id is missing");
    setStats([]);
    setRevenueData([]);
    return;
  }
  ```
  Also added `.eq("shop_id", user.shop_id)` to all queries.
- **Impact:** Ensures queries only run with valid shop context.

---

### 10. **No React Error Boundary** ✅
- **Files:** 
  - [src/components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx) (NEW)
  - [src/App.tsx](src/App.tsx#L1-L498)
- **Issue:** Unhandled runtime errors in any component caused entire app to go blank with no user feedback.
- **Fix:** 
  1. Created new `ErrorBoundary` component that catches runtime errors
  2. Displays user-friendly error UI with recovery options
  3. Shows error details in development mode
  4. Wrapped main `<AppContent />` in ErrorBoundary in App.tsx
- **Impact:** Graceful error handling and improved user experience during component failures.

---

## 📊 Summary of Changes

| Bug | File | Type | Severity |
|-----|------|------|----------|
| 1. Login counter reset | AuthContext.tsx | Security | Critical |
| 2. Shop_id data leak | BrowsePartsModal.tsx | Security | Critical |
| 3. Locale date keys | Dashboard.tsx | Logic Error | High |
| 4. Stale closure | MechanicDashboard.tsx | Logic Error | High |
| 5. JSON.parse crash | FeaturedSection.tsx | Robustness | High |
| 6. Channel leak | AppointmentCalendarPage.tsx | Memory Leak | High |
| 7. Logout cache | AuthContext.tsx | Data Leak | High |
| 8. Duplicate types | types/index.ts | Code Quality | Low |
| 9. Missing null check | Dashboard.tsx | Logic Error | High |
| 10. No error boundary | App.tsx + ErrorBoundary.tsx | UX/Robustness | High |

---

## 🧪 Testing Recommendations

1. **Authentication Flow:**
   - Test login rate limiting with multiple failed attempts
   - Verify counter resets after successful login
   - Test logout completely clears localStorage

2. **Data Security:**
   - Log in as different users and verify parts isolation
   - Test with missing/invalid shop_id scenarios
   - Verify dashboard doesn't show data when shop_id is missing

3. **Data Integrity:**
   - Generate revenue data on same day in different locales
   - Verify chart shows single entry, not duplicates
   - Test dashboard across different browsers/locales

4. **Memory/Performance:**
   - Monitor AppointmentCalendarPage mount/unmount with DevTools
   - Verify no lingering subscriptions in Network tab
   - Check localStorage after multiple logout/login cycles

5. **Error Handling:**
   - Corrupt localStorage data intentionally
   - Throw errors in components
   - Verify ErrorBoundary catches and displays gracefully

---

## 📝 Notes

- All fixes maintain backward compatibility
- No database schema changes required
- Changes are purely application-level
- ErrorBoundary shows detailed errors in dev mode only
- Production users see user-friendly error messages
