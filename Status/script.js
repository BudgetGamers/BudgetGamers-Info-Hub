const API_URL = 'https://daylong-giddily-culminate.ngrok-free.dev/status';

async function updateStatus() {
    const display = document.getElementById('server-display');

    if (!display) {
        console.error("Error: Could not find HTML element with id='server-display'.");
        return;
    }

    try {
        let liveInstances = [];
        try {
            const response = await fetch(API_URL, {
                method: 'GET'
            });

            if (response.ok) {
                const apiData = await response.json();
                const parsedApiData = Array.isArray(apiData) ? apiData[0] : apiData;
                liveInstances = parsedApiData.AvailableInstances || apiData || [];
            } else {
                console.warn(`HTTP Error: ${response.status}`);
            }
        } catch (fetchErr) {
            console.warn("Could not fetch dynamic status, defaulting to offline states.", fetchErr);
        }

        // Static data to keep the look consistent
        const staticConfig = {
            BaseDomain: 'budgetgamers.us',
            AvailableInstances: [
                {
                    InstanceName: 'MC01',
                    FriendlyName: 'Minecraft Survival',
                    Subdomain: 'jsmp', // -> jsmp.budgetgamers.us
                    UseSRV: true,    // Hides port if you have an SRV record
                    AppState: 0, // Default to offline, updated by API
                    ApplicationEndpoints: [{ Endpoint: '0.0.0.0:25565' }],
                    Metrics: { "Active Users": { RawValue: 0, MaxValue: 20 } },
                    Description: 'Main survival server with economy and plugins.',
                    ModuleDisplayName: 'Minecraft'
                },
                {
                    InstanceName: 'PZ01',
                    FriendlyName: 'Project Zomboid',
                    Subdomain: 'pz',
                    UseSRV: false,
                    AppState: 0, // Default to offline, updated by API
                    ApplicationEndpoints: [{ Endpoint: '0.0.0.0:16261' }],
                    Metrics: { "Active Users": { RawValue: 0, MaxValue: 32 } },
                    Description: 'Hardcore zombie survival.',
                    ModuleDisplayName: 'Project Zomboid'
                },
                {
                    InstanceName: 'ARK01',
                    FriendlyName: 'ARK: Survival Evolved',
                    Subdomain: 'ark',
                    UseSRV: false,
                    AppState: 0, // Default to offline, updated by API
                    ApplicationEndpoints: [{ Endpoint: '0.0.0.0:7777' }],
                    Metrics: { "Active Users": { RawValue: 0, MaxValue: 70 } },
                    Description: 'Dinosaur taming and base building.',
                    ModuleDisplayName: 'ARK'
                }
            ]
        };

        // Merge dynamic data into static configuration
        staticConfig.AvailableInstances.forEach(staticInstance => {
            const liveMatch = liveInstances.find(live => live.InstanceName === staticInstance.InstanceName);
            if (liveMatch) {
                // Update dynamic fields
                staticInstance.AppState = liveMatch.AppState;
                if (liveMatch.Metrics) {
                    staticInstance.Metrics = liveMatch.Metrics;
                }
            }
        });

        const data = staticConfig;
        const instances = data.AvailableInstances;

        // Base domain for connection addresses
        const baseDomain = data.BaseDomain || data.PublicIP || 'budgetgamers.us';

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

            const endpoint = server.ApplicationEndpoints?.[0]?.Endpoint || "";
            const port = endpoint.split(':').pop() || "25565";

            // Construct connection address
            let ipAddress = server.Subdomain ? `${server.Subdomain}.${baseDomain}` : baseDomain;
            if (!server.UseSRV) {
                ipAddress += `:${port}`;
            }

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

// Initial Fetch
updateStatus();

// Refresh every 30 seconds
setInterval(updateStatus, 30000);