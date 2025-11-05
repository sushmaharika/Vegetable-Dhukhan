import React, { useEffect } from 'react';

const PayPalButton = ({ amount, onSuccess }) => {
    useEffect(() => {
        try {
            const container = document.getElementById('paypal-button-container');
            if (!window.paypal || !container) return;
            if (container.hasChildNodes()) return;

            const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 1.00;
            const buttons = window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    value: safeAmount.toFixed(2), // Format to two decimal places
                                },
                            },
                        ],
                    });
                },
                onApprove: async (data, actions) => {
                    try {
                        const details = await actions.order.capture();
                        console.log('Payment approved: ', details);
                        onSuccess(details);
                    } catch (error) {
                        console.error('Error during payment capture: ', error);
                        alert('Payment could not be completed. Please try again.');
                    }
                },
                onError: (error) => {
                    console.error('PayPal Button error: ', error);
                    alert('An error occurred with the PayPal payment. Please try again.');
                },
            });
            buttons.render('#paypal-button-container');

            return () => {
                try {
                    // Clear the rendered button container on unmount to avoid script errors on navigation
                    const el = document.getElementById('paypal-button-container');
                    if (el) el.innerHTML = '';
                } catch (_) {}
            };
        } catch (e) {
            console.error('PayPal init error:', e);
        }
    }, [amount, onSuccess]);

    return <div id="paypal-button-container"></div>;
};

export default PayPalButton;
