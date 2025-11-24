import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

const BarberPostCard = ({ post }) => {
    return (
        <div className="relative group aspect-square">
            <img 
                src={post.image_url} 
                alt={post.caption || 'Barber post'} 
                className="w-full h-full object-cover rounded-md"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 text-white p-4">
                <p className="text-sm text-center">{post.caption}</p>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Heart size={20} />
                        <span>{Math.floor(Math.random() * 500)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageCircle size={20} />
                        <span>{Math.floor(Math.random() * 50)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarberPostCard;