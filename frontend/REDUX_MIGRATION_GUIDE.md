# Redux Toolkit Migration Guide

## ✅ What's Implemented

### Redux Store (Data Layer)
- ✅ **authSlice** - Authentication with async thunks
- ✅ **userSlice** - User profile management
- ✅ **Custom Hooks** - Easy Redux usage

### Context API (UI Layer - Kept)
- ✅ **ToastContext** - Notifications
- ✅ **SocketProvider** - Real-time events
- ✅ **ThemeProvider** - UI theme

---

## 📦 Installation

```bash
cd frontend
npm install @reduxjs/toolkit react-redux
```

---

## 🎯 How to Use Redux in Your Components

### 1. Import Hooks
```javascript
import { useAppDispatch, useAuth, useUser } from '../store/hooks';
import { loginUser, logoutUser } from '../store/slices/authSlice';
```

### 2. Use in Component
```javascript
const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const handleLogin = async () => {
    try {
      const result = await dispatch(loginUser({
        email: 'user@example.com',
        password: 'password123',
        captcha: 'token'
      })).unwrap();
      
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome {user.name}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};
```

---

## 🔄 Migration Steps for Existing Components

### Before (Context API):
```javascript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, login, logout } = useAuth();
  
  const handleLogin = async () => {
    await login(token, userData);
  };
  
  return <div>{user?.name}</div>;
};
```

### After (Redux):
```javascript
import { useAppDispatch, useAuth } from '../store/hooks';
import { loginUser, logoutUser } from '../store/slices/authSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  const handleLogin = async () => {
    await dispatch(loginUser({ email, password, captcha })).unwrap();
  };
  
  return <div>{user?.name}</div>;
};
```

---

## 📚 Available Actions

### Auth Actions
```javascript
// Login
dispatch(loginUser({ email, password, captcha }))

// Signup
dispatch(signupUser({ name, email, password, phone, role, captchaToken }))

// Logout
dispatch(logoutUser())

// Refresh Token
dispatch(refreshAccessToken())

// Update user (sync)
dispatch(updateUser({ name: 'New Name' }))

// Clear error (sync)
dispatch(clearError())
```

### User Actions
```javascript
// Fetch profile
dispatch(fetchUserProfile())

// Update profile
dispatch(updateUserProfile({ name, phone, address }))

// Clear error (sync)
dispatch(clearUserError())
```

---

## 🎨 Redux DevTools

1. Install Redux DevTools Extension in Chrome/Firefox
2. Open DevTools → Redux tab
3. See all actions, state changes, time-travel debugging

---

## 📁 File Structure

```
frontend/src/
├── store/
│   ├── index.js              # Store configuration
│   ├── hooks.js              # Custom hooks
│   └── slices/
│       ├── authSlice.js      # Auth state + thunks
│       └── userSlice.js      # User state + thunks
├── contexts/                 # Keep for UI state
│   ├── ToastContext.jsx      # Notifications
│   └── AuthContext.jsx       # (Can be removed after full migration)
└── hooks/
    └── useSocket.jsx         # Socket provider (keep)
```

---

## 🚀 Next Steps

### Phase 1: Auth Migration (Current)
- ✅ Setup Redux store
- ✅ Create auth slice
- ✅ Create user slice
- ⏳ Update LoginPage to use Redux
- ⏳ Update SignupPage to use Redux
- ⏳ Remove old AuthContext

### Phase 2: Add More Slices (Future)
- ⏳ queriesSlice - Legal queries
- ⏳ lawyersSlice - Lawyers list
- ⏳ casesSlice - Cases management
- ⏳ notificationsSlice - Notifications history

### Phase 3: Advanced Features (Optional)
- ⏳ RTK Query - API caching
- ⏳ Redux Persist - Persist state
- ⏳ Middleware - Custom logic

---

## 💡 Best Practices

1. **Use Async Thunks** for API calls
2. **Use .unwrap()** to handle success/error
3. **Keep UI state in Context** (Toast, Theme, Socket)
4. **Keep data state in Redux** (User, Queries, Cases)
5. **Use Redux DevTools** for debugging
6. **Don't store non-serializable data** in Redux (functions, promises)

---

## 🐛 Troubleshooting

### Error: "Cannot read property 'user' of undefined"
**Solution:** Make sure Redux Provider is wrapped around your app

### Error: "dispatch is not a function"
**Solution:** Use `useAppDispatch()` hook, not `useDispatch()` directly

### State not updating
**Solution:** Check Redux DevTools to see if action was dispatched

---

## 📖 Resources

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Async Thunks Guide](https://redux-toolkit.js.org/api/createAsyncThunk)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)

---

## ✅ Summary

**What Changed:**
- Added Redux Toolkit for state management
- Created auth and user slices with async thunks
- Kept Context API for UI state (Toast, Socket, Theme)

**What Stayed:**
- ToastContext for notifications
- SocketProvider for real-time
- All existing components work as before

**Benefits:**
- Better state management
- Time-travel debugging
- Easier testing
- Scalable architecture
