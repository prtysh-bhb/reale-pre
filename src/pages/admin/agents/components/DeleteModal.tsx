import React from "react";
import { AlertTriangle, LucideIcon, X } from "lucide-react";

interface DeleteModalProps {
  show: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  cancelText?: string;
  confirmText?: string;
  loadingText?: string;
  buttonColor?: string;
  modalIcon?: LucideIcon;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  show,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  onClose,
  onConfirm,
  loading = false,
  cancelText = "Cancel",
  confirmText = "Delete",
  loadingText = "Deleting...",
  buttonColor = "red",
  modalIcon: Icon
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            {Icon ? (<Icon className={`text-${buttonColor}-500`} size={24} />) : (<AlertTriangle className="text-yellow-500" size={24} />)}
            {title}
          </h4>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-600 text-sm mb-4">{message}</p>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded text-white text-sm cursor-pointer ${
              loading
                ? `bg-${buttonColor}-400 cursor-not-allowed`
                : `bg-${buttonColor}-600 hover:bg-${buttonColor}-700`
            }`}
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteModal;
