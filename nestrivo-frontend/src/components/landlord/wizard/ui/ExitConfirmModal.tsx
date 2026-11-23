"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExitConfirmModal({ isOpen, onClose }: ExitConfirmModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 max-w-md w-full space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Bạn có chắc chắn muốn rời đi?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Mọi thông tin bạn đã nhập đều đã được lưu tự động trong bộ nhớ tạm trình duyệt. Bạn có thể tiếp tục bất cứ lúc nào khi quay lại trang này.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors min-h-[44px]"
          >
            Ở lại chỉnh sửa
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/landlord/dashboard");
            }}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] transition-all min-h-[44px] shadow-xs"
          >
            Về Bảng điều khiển
          </button>
        </div>
      </div>
    </div>
  );
}
