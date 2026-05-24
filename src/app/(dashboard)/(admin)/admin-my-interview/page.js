import MyInterview from '@/components/dashboard-components/MyInterview';
import React, { useEffect } from 'react';
import { useRef } from 'react';

const MyInterviewPage = () => {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            const counters = document.querySelectorAll('.counter');
            counters.forEach(counter => {
                counter.innerText = '0';
                const updateCounter = () => {
                    const target = +counter.getAttribute('data-target');
                    const c = +counter.innerText;
                    const increment = target / 200;
                    if(c < target) {
                        counter.innerText = `${Math.ceil(c + increment)}`;
                        setTimeout(updateCounter, 10);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
            });
            initialized.current = true;
        }
    }, []);

    return (
        <div><MyInterview /></div>
    );
}

export default MyInterviewPage;
