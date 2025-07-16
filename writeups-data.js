// This is our "database" of writeups.
// In a real-world scenario, this might be a JSON file or an API endpoint.
const writeupsData = [
    {
        id: 'my-first-post',
        title: 'My First CTF Writeup: A Journey into Crypto',
        date: '2025-07-16',
        tags: ['crypto', 'beginner', 'ctf'],
        preview: 'This was my first ever CTF and I decided to tackle a simple cryptography challenge. The challenge involved a classic Caesar cipher, but with a twist...',
        image: 'https://placehold.co/600x400/1a1a1a/50fa7b?text=Crypto',
        contentPath: '/writeups-content/my-first-post.md'
    },
    {
        id: 'pwn-101',
        title: 'Pwn 101: Understanding Buffer Overflows',
        date: '2025-07-10',
        tags: ['pwn', 'binary-exploitation', 'tutorial'],
        preview: 'Buffer overflows are a classic vulnerability. In this post, we will explore what they are, how they work, and how to exploit a simple one from scratch...',
        image: 'https://placehold.co/600x400/1a1a1a/8be9fd?text=Pwn',
        contentPath: '/writeups-content/pwn-101.md'
    },
    {
        id: 'web-sec-intro',
        title: 'Introduction to Web Security',
        date: '2025-06-28',
        tags: ['web', 'security', 'tutorial', 'beginner'],
        preview: 'The web is a wild place. This article serves as a starting point for anyone interested in web security, covering common vulnerabilities like XSS and SQLi...',
        image: null, // Example of a post without an image
        contentPath: '/writeups-content/web-sec-intro.md'
    },
    {
        id: 'advanced-crypto-math',
        title: 'The Math Behind Modern Cryptography',
        date: '2025-06-15',
        tags: ['crypto', 'math', 'advanced'],
        preview: 'Elliptic curves, finite fields, and discrete logarithms. These are the mathematical foundations of the cryptography we use every day. Let\'s dive deep...',
        image: 'https://placehold.co/600x400/1a1a1a/50fa7b?text=Math',
        contentPath: '/writeups-content/advanced-crypto-math.md'
    }
];
