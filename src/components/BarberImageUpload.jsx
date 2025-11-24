import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { optimizeImageForMobile } from '@/lib/imageOptimization';

const BarberImageUpload = ({ onFileSelect, currentImageUrl }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(currentImageUrl || null);
    const [isDragging, setIsDragging] = useState(false);
    const [dimensions, setDimensions] = useState(null);
    const [processing, setProcessing] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    useEffect(() => {
        setPreview(currentImageUrl);
        if (currentImageUrl) {
            const img = new Image();
            img.src = currentImageUrl;
            img.onload = () => setDimensions({ width: img.width, height: img.height });
        } else {
            setDimensions(null);
        }
    }, [currentImageUrl]);

    const handleFileChange = async (selectedFile) => {
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setProcessing(true);
            try {
                const optimizedFile = await optimizeImageForMobile(selectedFile);
                setFile(optimizedFile);
                onFileSelect(optimizedFile);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                    const img = new Image();
                    img.src = reader.result;
                    img.onload = () => setDimensions({ width: img.width, height: img.height });
                };
                reader.readAsDataURL(optimizedFile);
            } catch (error) {
                console.error("Image optimization error:", error);
                toast({ variant: "destructive", title: "Hata", description: "Resim işlenirken bir sorun oluştu." });
            } finally {
                setProcessing(false);
            }
        } else {
            toast({ variant: "destructive", title: "Geçersiz Dosya", description: "Lütfen bir resim dosyası seçin." });
        }
    };

    const handleInputChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileChange(selectedFile);
        }
    };
    
    const handleDragEvents = (e, dragging) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e) => {
        handleDragEvents(e, false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            handleFileChange(droppedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreview(currentImageUrl || null);
        setDimensions(null);
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full space-y-4">
            {preview ? (
                <div className="relative w-32 h-32 mx-auto">
                    <img src={preview} alt="Önizleme" className="w-full h-full object-cover rounded-full border-2 border-[color:var(--tr-border-strong)]" />
                    <Button variant="destructive" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full" onClick={removeFile}>
                        <X size={16} />
                    </Button>
                    {dimensions && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {dimensions.width}x{dimensions.height}
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-[color:var(--tr-accent)] bg-[color:var(--tr-accent-soft)]' : 'border-[color:var(--tr-border-strong)] hover:border-[color:var(--tr-accent)]'}`}
                >
                    <input id="dropzone-file" type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleInputChange} />
                    <label htmlFor="dropzone-file" className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center p-4">
                        {processing ? (
                            <Loader2 className="w-10 h-10 animate-spin text-[color:var(--tr-accent)]" />
                        ) : (
                            <>
                                <UploadCloud className={`w-10 h-10 mb-3 text-[color:var(--tr-text-muted)] ${isDragging ? 'text-[color:var(--tr-accent)]' : ''}`} />
                                <p className={`font-semibold ${isDragging ? 'text-[color:var(--tr-accent)]' : ''}`}>Tıkla veya sürükle bırak</p>
                                <p className="text-xs text-[color:var(--tr-text-muted)]">PNG, JPG veya GIF (Max 800px)</p>
                            </>
                        )}
                    </label>
                </div>
            )}
        </div>
    );
};

export default BarberImageUpload;