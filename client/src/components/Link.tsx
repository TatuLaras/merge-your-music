import { useState } from 'react';

export function Link({ link }: { link: string }) {
    const [linkCopied, setLinkCopied] = useState<boolean>(false);

    function copyLinkToClipboard() {
        navigator.clipboard.writeText(link);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 1000);
    }
    
    return (
        <div className='link'>
            <p className='info'>
                Send this link to someone you want to Merge Your Music with!
            </p>
            <div className='url'>
                <div className='text'>{link}</div>
                <div className='button-copy' onClick={copyLinkToClipboard}>
                    {linkCopied ? (
                        <i className='fa-solid fa-check'></i>
                    ) : (
                        <i className='fa-solid fa-copy'></i>
                    )}
                </div>
            </div>
        </div>
    );
}
