export function loadPayPal(clientId = 'sb', currency = 'USD') {
    return new Promise((resolve, reject) => {
        try {
            if (window.paypal) {
                resolve(window.paypal);
                return;
            }
            const existing = document.querySelector('script[src*="paypal.com/sdk/js"]');
            if (existing) {
                existing.addEventListener('load', () => resolve(window.paypal));
                existing.addEventListener('error', (e) => reject(e));
                return;
            }
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
            script.async = true;
            script.onload = () => resolve(window.paypal);
            script.onerror = (e) => reject(e);
            document.body.appendChild(script);
        } catch (e) {
            reject(e);
        }
    });
}


