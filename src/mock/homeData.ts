import {
  HeroStats,
  ProcessStep,
  Feature,
  MembershipTier,
  CustomerReview
} from '../types/home'

export const mockHeroStats: HeroStats = {
  customers: 15400,
  bookings: 48900,
  branches: 8,
  satisfactionRate: 99.2
}

export const mockProcessSteps: ProcessStep[] = [
  {
    id: 1,
    stepNumber: '01',
    title: 'Đặt lịch trực tuyến',
    description: 'Chọn chi nhánh, thời gian và dịch vụ phù hợp chỉ trong 30 giây qua website hoặc ứng dụng.',
    iconName: 'CalendarCheck'
  },
  {
    id: 2,
    stepNumber: '02',
    title: 'Bàn giao & Checklist xe',
    description: 'Kỹ thuật viên lập biên bản tiếp nhận xe chi tiết kèm hình ảnh rõ ràng trước khi thao tác.',
    iconName: 'ClipboardCheck'
  },
  {
    id: 3,
    stepNumber: '03',
    title: 'Chăm sóc chuyên sâu',
    description: 'Sử dụng quy trình rửa xe 3 bước đạt chuẩn kết hợp dung dịch cao cấp nhập khẩu từ Châu Âu.',
    iconName: 'Sparkles'
  },
  {
    id: 4,
    stepNumber: '04',
    title: 'Nhận xe & Tích điểm',
    description: 'Kiểm tra chất lượng hoàn hảo, thanh toán tiện lợi và tự động tích điểm nâng hạng thành viên.',
    iconName: 'Award'
  }
]

export const mockFeatures: Feature[] = [
  {
    id: 'f1',
    title: 'Theo Dõi Trạng Thái Real-time',
    description: 'Cập nhật trực tiếp từng công đoạn rửa xe của bạn trên ứng dụng theo thời gian thực.',
    iconName: 'Eye',
    highlightText: 'Độc quyền'
  },
  {
    id: 'f2',
    title: 'Biên Bản Giao Nhận Số Hóa',
    description: 'Đảm bảo minh bạch tuyệt đối tình trạng trầy xước, đồ đạc trên xe bằng hình ảnh chụp thực tế.',
    iconName: 'ShieldCheck',
    highlightText: 'Minh bạch'
  },
  {
    id: 'f3',
    title: 'Tích Điểm Tự Động & Đổi Quà',
    description: 'Mỗi 10,000đ chi tiêu đều tích lũy điểm thưởng để đổi voucher và miễn phí dịch vụ.',
    iconName: 'Gift',
    highlightText: 'Ưu đãi'
  },
  {
    id: 'f4',
    title: 'Chuỗi Chi Nhánh Chuẩn Chuẩn 5★',
    description: 'Phòng chờ sang trọng với WiFi tốc độ cao, cà phê miễn phí và hệ thống lọc nước rửa xe chuẩn công nghiệp.',
    iconName: 'MapPin',
    highlightText: 'Đẳng cấp'
  }
]

export const mockTiers: any[] = [];

export const mockCustomerReviews: CustomerReview[] = [
  {
    id: 'rev-1',
    customerName: 'Anh Trần Minh Tuấn',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    carModel: 'Mercedes-Benz C300 AMG',
    rating: 5,
    comment: 'Tôi rất ấn tượng với biên bản bàn giao xe số hóa của Hybrid Wash. Quy trình chuyên nghiệp, khoang máy dọn xong nhìn như mới đập hộp!',
    date: '15/07/2026',
    branchName: 'Chi Nhánh Quận 1'
  },
  {
    id: 'rev-2',
    customerName: 'Chị Nguyễn Phương Thảo',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    carModel: 'Porsche Macan GTS',
    rating: 5,
    comment: 'Tính năng theo dõi tiến độ rửa xe theo thời gian thực rất tiện. Đặt lịch online không bao giờ phải chờ đợi, phòng chờ cực thơm và hiện đại.',
    date: '28/07/2026',
    branchName: 'Chi Nhánh Quận 7'
  },
  {
    id: 'rev-3',
    customerName: 'Anh Hoàng Quốc Bảo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    carModel: 'BMW 530i M Sport',
    rating: 5,
    comment: 'Combo Ceramic ở đây làm rất kĩ. Kháng nước lá sen rõ rệt sau 2 tháng sử dụng. Điểm thưởng tích lại được đổi voucher quá xịn!',
    date: '01/08/2026',
    branchName: 'Chi Nhánh Thủ Đức'
  }
]
