# My First CTF Writeup: A Journey into Crypto

This was my first ever CTF and I decided to tackle a simple cryptography challenge. The challenge involved a classic Caesar cipher, but with a twist.

## The Challenge

We were given a string of ciphertext: `GUR DHVPX OEBJA SBK WHZCF BIRE GUR YNML QBT`.

The description mentioned "a classic Roman general," which is a dead giveaway for a Caesar cipher. The standard Caesar cipher shifts letters by 3, but that didn't work. We needed to find the correct shift.

## The Math

The Caesar cipher is a simple substitution cipher where each letter is shifted by a fixed number of positions down the alphabet. The formula can be expressed as:

$E_n(x) = (x + n) \pmod{26}$

Where $x$ is the letter, and $n$ is the shift. To decrypt, we use the inverse:

$D_n(x) = (x - n) \pmod{26}$

We can brute-force all 25 possible shifts.

## The Solution

After trying a few shifts, a shift of 13 places (also known as ROT13) revealed the plaintext.

Here's a block-level LaTeX example showing a more complex formula, like the quadratic formula, just for demonstration:

$$
x = {-b \pm \sqrt{b^2-4ac} \over 2a}
$$

This was a fun introduction to CTFs, and it highlights the importance of recognizing classic ciphers.