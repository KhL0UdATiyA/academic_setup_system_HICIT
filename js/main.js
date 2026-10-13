const rootElement = document.getElementById('root');

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

setTimeout(() => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}, 300);
