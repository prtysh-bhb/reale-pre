/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getPropertyDocuments,
  uploadPropertyDocuments,
  deletePropertyDocument,
} from "@/api/agent/propertyDocuments";
import {
  Loader2,
  Trash2,
  Upload,
  FileText,
  Eye,
  X,
  AlertTriangle,
  Image as ImageIcon,
  File,
  Download,
  FolderOpen,
  Paperclip,
} from "lucide-react";
import { validateImage } from "@/helpers/image_helper";

interface Props {
  propertyId: number;
}

const PropertyDocuments = ({ propertyId }: Props) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [hoveredDoc, setHoveredDoc] = useState<number | null>(null);

  const fetchDocuments = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const res = await getPropertyDocuments(propertyId);
      setDocuments(res.data.data.documents || []);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [propertyId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const validFiles = validateImage(e, 10); // 10 MB limit
    if (!validFiles) return;

    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      await uploadPropertyDocuments(propertyId, files);
      toast.success("Documents uploaded successfully!");
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = (index: number) => {
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (deleteIndex === null) return;
    try {
      await deletePropertyDocument(propertyId, deleteIndex);
      toast.success("Document deleted successfully");
      fetchDocuments();
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setShowConfirm(false);
      setDeleteIndex(null);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return { icon: FileText, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return { icon: ImageIcon, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
      case 'doc':
      case 'docx':
        return { icon: FileText, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
      default:
        return { icon: File, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' };
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="dark:bg-gray-800/50 bg-white rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-black/30 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <FolderOpen className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold dark:text-white text-gray-800">
              Property Documents
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload and manage property-related documents
            </p>
          </div>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-medium">
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> 
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={18} /> 
              <span>Upload Documents</span>
            </>
          )}
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
          />
        </label>
      </div>

      {/* File Upload Guidelines */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Paperclip className="text-blue-500 dark:text-blue-400 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              Supported files: PDF, DOC, DOCX, JPG, PNG, TXT, XLSX
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Maximum file size: 10MB per file • You can select multiple files at once
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-3 border-blue-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading documents...</p>
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc, index) => {
            const fileUrl = doc.url;
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.name);
            const fileIcon = getFileIcon(doc.name);
            const IconComponent = fileIcon.icon;
            
            return (
              <div
                key={index}
                className="group relative dark:bg-gray-800/30 bg-white rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1"
                onMouseEnter={() => setHoveredDoc(index)}
                onMouseLeave={() => setHoveredDoc(null)}
              >
                {/* Document Preview */}
                {isImage ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-lg mb-3">
                    <img
                      src={fileUrl}
                      alt={doc.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Image+Error";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 mb-3">
                    <div className={`w-16 h-16 ${fileIcon.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <IconComponent className={`w-8 h-8 ${fileIcon.color}`} />
                    </div>
                  </div>
                )}

                {/* Document Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold dark:text-white text-gray-800 truncate">
                      {doc.name}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(doc.size || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                      {doc.name.split('.').pop()?.toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>Uploaded</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`absolute top-3 right-3 flex gap-1 transition-all duration-300 ${
                  hoveredDoc === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-md transition-all hover:scale-110"
                    title="View Document"
                  >
                    <Eye size={16} />
                  </a>
                  <a
                    href={fileUrl}
                    download
                    className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-lg hover:shadow-md transition-all hover:scale-110"
                    title="Download"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => confirmDelete(index)}
                    className="p-2 bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-lg hover:shadow-md transition-all hover:scale-110"
                    title="Delete Document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 dark:bg-gray-800/30 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 dark:border-gray-700 border-gray-200 border">
            <FileText className="w-10 h-10 text-gray-400 dark:text-gray-600" />
          </div>
          <h4 className="text-lg font-semibold dark:text-gray-300 text-gray-700 mb-2">
            No Documents Yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Upload property documents, images, or files to get started
          </p>
          <label className="cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-medium">
            <Upload size={18} />
            <span>Upload Your First Document</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
            />
          </label>
        </div>
      )}

      {/* Stats Summary */}
      {documents.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium dark:text-gray-300 text-gray-700">
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </span> uploaded
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">PDF: {documents.filter(d => d.name.toLowerCase().endsWith('.pdf')).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">Images: {documents.filter(d => /\.(jpg|jpeg|png|gif)$/i.test(d.name)).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">Documents: {documents.filter(d => /\.(doc|docx|txt)$/i.test(d.name)).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="dark:bg-gray-800 bg-white rounded-2xl shadow-2xl dark:shadow-black/40 p-6 w-full max-w-md border dark:border-gray-700/50 border-gray-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg">
                  <AlertTriangle className="text-white" size={20} />
                </div>
                <h4 className="text-lg font-semibold dark:text-white text-gray-800">
                  Confirm Delete
                </h4>
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="dark:text-gray-300 text-gray-600 text-sm mb-3 leading-relaxed">
                Are you sure you want to delete this document? This action cannot be undone.
              </p>
              {deleteIndex !== null && documents[deleteIndex] && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center">
                      {getFileIcon(documents[deleteIndex].name).icon === ImageIcon ? (
                        <ImageIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dark:text-white text-gray-800 truncate">
                        {documents[deleteIndex].name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(documents[deleteIndex].size || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300 text-gray-700 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDocuments;