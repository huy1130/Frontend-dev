import React, { useState, useRef } from 'react';
import { X, Phone, KeyRound, Lock, Loader2, Eye, EyeOff, ArrowRight, Mail } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setOtpArray(Array(6).fill(''));
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Xử lý khi user paste nguyên chuỗi 6 số
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpArray];
      pasted.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtpArray(newOtp);
      setOtp(newOtp.join(''));
      
      const nextIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    
    // Chỉ cho phép nhập số
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);
    setOtp(newOtp.join(''));
    
    // Tự động focus ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      toast.success(response.message || 'Mã OTP đã được gửi');
      
      setStep(2);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể yêu cầu mã OTP lúc này';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Vui lòng nhập đủ 6 số mã OTP');
      return;
    }

    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
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
        email,
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
                Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã OTP để bạn đặt lại mật khẩu.
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80">Địa chỉ Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Mail className="w-5 h-5 text-white/40 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
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
          ) : step === 2 ? (
            <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <p className="text-white/70 text-sm mb-4">
                Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra và nhập mã xác thực.
              </p>
              
              {/* OTP */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white/80 text-center block">Mã xác thực (OTP)</label>
                <div className="flex justify-center gap-3">
                  {otpArray.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onFocus={(e) => e.target.select()}
                      className="w-12 h-14 bg-black/40 border border-white/10 text-white rounded-xl text-center text-xl font-bold outline-none focus:border-orange-500/80 focus:bg-black/60 transition-all focus:shadow-[0_0_10px_rgba(249,115,22,0.3)] placeholder:text-white/20"
                      maxLength={6}
                      autoComplete="one-time-code"
                      placeholder="-"
                      required={idx === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl py-3.5 transition-all border border-white/10"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-gradient-to-r from-orange-500 to-[#f97316] hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"
                >
                  Xác nhận
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <p className="text-emerald-400/90 text-sm mb-4 font-medium">
                ✓ Mã OTP hợp lệ. Vui lòng tạo mật khẩu mới.
              </p>
              
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

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl py-3.5 transition-all border border-white/10"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 bg-gradient-to-r from-orange-500 to-[#f97316] hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] disabled:opacity-70 disabled:hover:translate-y-0"
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
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
