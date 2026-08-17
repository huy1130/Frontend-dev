import { toast } from 'sonner';

/**
 * Xóa toàn bộ thông tin xác thực từ localStorage và sessionStorage.
 */
export function clearAuthState(): void {
  const authKeys = [
    'token',
    'userRole',
    'fullName',
    'phoneNumber',
    'currentTier',
    'currentPoints',
  ];

  authKeys.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}

/**
 * Kiểm tra xem JWT token đã hết hạn hay chưa dựa vào claim 'exp'.
 */
export function isTokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    
    if (!payload.exp) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    // Hết hạn nếu thời gian hiện tại >= payload.exp
    return payload.exp <= currentTime;
  } catch (error) {
    console.error('Lỗi khi decode JWT token:', error);
    return true;
  }
}

let isLoggingOut = false;

/**
 * Tự động đăng xuất và điều hướng về trang /login khi token hết hạn hoặc lỗi 401.
 */
export function handleAutoLogout(message: string = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!'): void {
  if (isLoggingOut) return;
  isLoggingOut = true;

  clearAuthState();
  toast.error(message);

  setTimeout(() => {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    isLoggingOut = false;
  }, 300);
}
