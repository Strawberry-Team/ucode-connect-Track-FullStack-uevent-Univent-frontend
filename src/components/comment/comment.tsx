'use client';

import { DiscussionEmbed } from 'disqus-react';
import { DisqusCommentsProps } from '@/types/comment';
export default function CommentsDisqus({ id, title, url }: DisqusCommentsProps) {
    return (
        <div className="mt-8 border-t pt-8">
            <div className="bg-white p-4 rounded-lg">
                <style jsx global>{`
                    #disqus_thread {
                        color-scheme: light;
                        background: white;
                        color: black;
                    }
                `}</style>
                <DiscussionEmbed
                    shortname='uevent-1'
                    config={{
                        url: url,
                        identifier: id.toString(),
                        title: title,
                        language: 'en'
                    }}
                />
            </div>
        </div>
    );
} 