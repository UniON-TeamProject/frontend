import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

const CommandsList = forwardRef(({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
                return true;
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((prev) => (prev + 1) % items.length);
                return true;
            }
            if (event.key === 'Enter') {
                const item = items[selectedIndex];
                if (item) command(item);
                return true;
            }
            return false;
        },
    }));

    if (!items.length) {
        return <div style={styles.menu}><div style={styles.noResult}>Brak wyników</div></div>;
    }

    return (
        <div style={styles.menu}>
            {items.map((item, index) => (
                <button
                    key={index}
                    style={{
                        ...styles.button,
                        backgroundColor: index === selectedIndex ? '#e8e8e8' : 'transparent',
                    }}
                    onClick={() => command(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                >
                    {item.title}
                </button>
            ))}
        </div>
    );
});

const styles = {
    menu: {
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        padding: '4px',
    },
    button: {
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        padding: '6px 12px',
        textAlign: 'left',
        fontSize: '14px',
        width: '100%',
    },
    noResult: {
        padding: '6px 12px',
        color: '#999',
        fontSize: '14px',
    },
};

export default CommandsList;
