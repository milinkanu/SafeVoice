import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { hashFile } from '../../lib/hash';

export function FileUpload({ onUploadChange, maxFiles = 5, maxSize = 50 * 1024 * 1024, className = '' }) {
    const [files, setFiles] = useState([]);

    const onDrop = useCallback(async (acceptedFiles) => {
        const newFiles = await Promise.all(
            acceptedFiles.map(async (file) => {
                const hash = await hashFile(file);
                return {
                    file,
                    id: hash + '-' + Date.now(),
                    name: file.name,
                    size: file.size,
                    hash,
                    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
                };
            })
        );

        setFiles((prev) => {
            const updated = [...prev, ...newFiles].slice(0, maxFiles);
            if (onUploadChange) onUploadChange(updated);
            return updated;
        });
    }, [maxFiles, onUploadChange]);

    const removeFile = (id) => {
        setFiles((prev) => {
            const updated = prev.filter(f => f.id !== id);
            if (onUploadChange) onUploadChange(updated);
            return updated;
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize,
        maxFiles: maxFiles - files.length
    });

    return (
        <div className={`space-y-4 ${className}`}>
            {files.length < maxFiles && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-accent-primary bg-accent-primary/10' : 'border-border-default hover:border-accent-primary hover:bg-bg-surface'
                        }`}
                >
                    <input {...getInputProps()} />
                    <Upload className={`w-8 h-8 mx-auto mb-4 ${isDragActive ? 'text-accent-primary' : 'text-text-muted'}`} />
                    <p className="text-text-primary mb-2 text-sm">Drag & drop files here, or click to select</p>
                    <p className="text-xs text-text-muted">Accepted: Images, PDF, Audio, Video (Max {maxFiles} files, 50MB each)</p>
                </div>
            )}

            {files.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-text-primary">Uploaded Evidence ({files.length}/{maxFiles})</h4>
                    {files.map(f => (
                        <div key={f.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-border-default bg-bg-surface gap-3 group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                {f.preview ? (
                                    <img src={f.preview} alt={f.name} className="w-10 h-10 object-cover rounded bg-bg-primary" />
                                ) : (
                                    <div className="w-10 h-10 flex items-center justify-center bg-bg-primary rounded text-text-muted">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-text-primary truncate" title={f.name}>{f.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5" title="File Fingerprint (SHA-256)">
                                        <CheckCircle className="w-3.5 h-3.5 text-accent-primary" />
                                        <p className="text-xs font-mono text-text-muted truncate w-32 sm:w-48">
                                            {f.hash.substring(0, 16)}...
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                                className="p-1.5 text-text-muted hover:text-accent-danger hover:bg-bg-primary rounded-md transition-colors"
                                title="Remove file"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <p className="text-xs text-accent-primary bg-accent-primary/10 p-2 rounded border border-accent-primary/20">
                        <strong>Fingerprint Generated:</strong> A local hash prevents tampering evidence.
                    </p>
                </div>
            )}
        </div>
    );
}
