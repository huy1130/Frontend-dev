import React, { useState } from 'react';
import { X, Phone, KeyRound, Lock, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setPhone('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({ phoneNumber: phone });
      toast.success(response.message || 'Mã OTP đã được gửi');
      
      // For development: log the OTP to console so we can test easily
      if (response.otp) {
        console.log('--- DEVELOPMENT ONLY: OTP RECEIVED ---');
        console.log(`OTP cho số điện thoại ${phone} là: ${response.otp}`);
        console.log('---------------------------------------');
        // Optional: auto-fill for super fast testing
        // setOtp(response.otp);
      }
      
      setStep(2);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể yêu cầu mã OTP lúc này';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword({ 
        phoneNumber: phone,
        otp,
        newPassword
      });
      toast.success(response.message || 'Cập nhật mật khẩu thành công!');
      handleClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể đặt lại mật khẩu';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-dark-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Quên Mật Khẩu</h2>
          <button 
            onClick={handleClose}
            className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <p className="text-white/70 text-sm">
                Vui lòng nhập số điện thoại đã đăng ký. Chúng tôi sẽ gửi mã OTP để bạn đặt lại mật khẩu.
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80">Số điện thoại</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Phone className="w-5 h-5 text-white/40 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-orange-500/50 focus:bg-black/60 transition-all placeholder:text-white/30"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-[#f97316] hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="text-white/70 text-sm mb-4">
                Mã OTP đã được gửi. Vui lòng kiểm tra và nhập mật khẩu mới.
              </p>
              
              {/* OTP */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80">Mã xác thực (OTP)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <KeyRound className="w-5 h-5 text-white/40 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập mã 6 số"
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-orange-500/50 focus:bg-black/60 transition-all placeholder:text-white/30 tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80">Mật khẩu mới</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Lock className="w-5 h-5 text-white/40 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới"
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-12 pr-12 py-3 outline-none focus:border-orange-500/50 focus:bg-black/60 transition-all placeholder:text-white/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80">Xác nhận mật khẩu mới</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Lock className="w-5 h-5 text-white/40 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-12 pr-12 py-3 outline-none focus:border-orange-500/50 focus:bg-black/60 transition-all placeholder:text-white/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/40 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-[#f97316] hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 mt-4 transition-all transform hover:-translate-y-0.5 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>Cập nhật mật khẩu</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
