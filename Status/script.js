// Replace this with your exact LocalTunnel subdomain
const API_URL = 'https://neat-rat-48.loca.lt/status';

async function updateStatus() {
    const display = document.getElementById('server-display');
    try {
        // Fetch directly from LocalTunnel API endpoint
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                // REQUIRED: Tells LocalTunnel to return raw JSON instead of its default warning page
                'Bypass-Tunnel-Remainder': 'true'
            }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const rawData = await response.json();
        const data = Array.isArray(rawData) ? rawData[0] : rawData;
        const instances = data.AvailableInstances || [];

        display.innerHTML = '';

        instances.forEach(server => {
            if (server.InstanceName === 'ADS01') return;

            let statusText, statusClass;
            const state = Number(server.AppState);

            if (state === 20 || state === 50) {
                statusText = "Online";
                statusClass = "status-online";
            } else if (state === 10 || state === 30) {
                statusText = "Starting";
                statusClass = "status-starting";
            } else {
                statusText = "Offline";
                statusClass = "status-offline";
            }

            // PULLING THE PORT: Splits "0.0.0.0:PORT" and takes the end
            const endpoint = server.ApplicationEndpoints?.[0]?.Endpoint || "";
            const port = endpoint.split(':').pop() || "25565";
            const ipAddress = `25.32.195.216:${port}`;

            const players = server.Metrics?.["Active Users"]?.RawValue ?? 0;
            const maxPlayers = server.Metrics?.["Active Users"]?.MaxValue ?? 0;
            const description = server.Description ? `<p>${server.Description}</p>` : '';

            display.innerHTML += `
                <div class="server-card">
                    <div class="card-header">
                        <h3>${server.FriendlyName}</h3>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="server-info">
                        ${description}
                        <p><b>Game:</b> ${server.ModuleDisplayName || server.Module}</p>
                        <p><b>Players:</b> ${players} / ${maxPlayers}</p>
                        <div class="ip-container">
                            <span class="ip-text">${ipAddress}</span>
                            <button class="btn btn-secondary copy-btn" data-copy="${ipAddress}" title="Copy IP" 
                                style="padding: 6px 12px; font-size: 0.75rem; border-radius: 20px; display: flex; align-items: center; gap: 0px;">
                                <span>Copy</span>
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("Fetch Error:", err);
        display.innerHTML = "<p>Status currently unavailable.</p>";
    }
}

// Event Delegation for Copy Buttons
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;

    const textToCopy = btn.getAttribute('data-copy');
    try {
        await navigator.clipboard.writeText(textToCopy);

        const originalContent = btn.innerHTML;
        btn.innerHTML = '<span style="color: #10b981; font-size: 0.65rem; font-weight: 800; white-space: nowrap;">COPIED!</span>';

        setTimeout(() => {
            btn.innerHTML = originalContent;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
});

updateStatus();