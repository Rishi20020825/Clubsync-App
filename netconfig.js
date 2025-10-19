export const netconfig = {
    // Main API URL - Change this to match your server
    // API_BASE_URL: 'http://10.28.82.62:3000', // Change this when your network changes(otiginal)
    API_BASE_URL: 'http://10.37.192.228:3000', // Change this when your network changes(rashmika  )
    
    // Alternative URLs - Uncomment the one that works for your setup
    // API_BASE_URL: 'http://10.0.2.2:3000', // Android emulator accessing localhost
    // API_BASE_URL: 'http://localhost:3000', // iOS simulator
    // API_BASE_URL: 'http://192.168.1.X:3000', // Replace X with your local IP last digit
    
    // List of URLs to try (used by findWorkingUrl)
    API_FALLBACKS: [
        'http://10.21.133.101:3000', // Original URL
        'http://10.0.2.2:3000',     // Android emulator
        'http://localhost:3000',    // iOS simulator
        'http://10.21.133.101:3000' // Common local IP
    ],
    
    // Debug helper to print the URL being used
    logUrl: () => {
        console.log('Current API URL:', netconfig.API_BASE_URL);
        return netconfig.API_BASE_URL;
    },
    
    // Test if an API URL is reachable
    testUrl: async (url) => {
        console.log(`Testing URL: ${url}`);
        try {
            // Try directly with the events/all endpoint that we know works
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${url}/api/events/all`, { 
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log(`URL ${url} responded with status: ${response.status}`);
            return response.ok;
        } catch (error) {
            console.log(`URL ${url} failed: ${error.message}`);
            return false;
        }
    },
    
    // Find the first working API URL
    findWorkingUrl: async () => {
        console.log('Finding working API URL...');
        
        // Try main URL first
        if (await netconfig.testUrl(netconfig.API_BASE_URL)) {
            console.log(`✅ Main URL works: ${netconfig.API_BASE_URL}`);
            return netconfig.API_BASE_URL;
        }
        
        // Try fallbacks
        for (const url of netconfig.API_FALLBACKS) {
            if (url !== netconfig.API_BASE_URL && await netconfig.testUrl(url)) {
                console.log(`✅ Found working URL: ${url}`);
                return url;
            }
        }
        
        // If nothing works, return the default
        console.log('❌ No working API URL found, using default');
        return netconfig.API_BASE_URL;
    }
};